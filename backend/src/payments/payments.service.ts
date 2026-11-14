import {
  BadGatewayException,
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PaymentMethod, PaymentProvider, PaymentStatus, Prisma, TransactionType } from '@prisma/client';
import { randomUUID } from 'node:crypto';
import { PrismaService } from '../common/services/prisma.service';
import { signFinikRequest, verifyFinikRequest } from './finik-signature';

interface FinikWebhook {
  id?: unknown;
  transactionId?: unknown;
  status?: unknown;
  amount?: unknown;
  currency?: unknown;
  transactionDate?: unknown;
  fields?: { amount?: unknown; paymentId?: unknown };
}

const FINIK_PUBLIC_KEYS = {
  production: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAuF/PUmhMPPidcMxhZBPb\nBSGJoSphmCI+h6ru8fG8guAlcPMVlhs+ThTjw2LHABvciwtpj51ebJ4EqhlySPyT\nhqSfXI6Jp5dPGJNDguxfocohaz98wvT+WAF86DEglZ8dEsfoumojFUy5sTOBdHEu\ng94B4BbrJvjmBa1YIx9Azse4HFlWhzZoYPgyQpArhokeHOHIN2QFzJqeriANO+wV\naUMta2AhRVZHbfyJ36XPhGO6A5FYWQgjzkI65cxZs5LaNFmRx6pjnhjIeVKKgF99\n4OoYCzhuR9QmWkPl7tL4Kd68qa/xHLz0Psnuhm0CStWOYUu3J7ZpzRK8GoEXRcr8\ntQIDAQAB\n-----END PUBLIC KEY-----`,
  beta: `-----BEGIN PUBLIC KEY-----\nMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAwlrlKz/8gLWd1ARWGA/8\no3a3Qy8G+hPifyqiPosiTY6nCHovANMIJXk6DH4qAqqZeLu8pLGxudkPbv8dSyG7\nF9PZEAryMPzjoB/9P/F6g0W46K/FHDtwTM3YIVvstbEbL19m8yddv/xCT9JPPJTb\nLsSTVZq5zCqvKzpupwlGS3Q3oPyLAYe+ZUn4Bx2J1WQrBu3b08fNaR3E8pAkCK27\nJqFnP0eFfa817VCtyVKcFHb5ij/D0eUP519Qr/pgn+gsoG63W4pPHN/pKwQUUiAy\nuLSHqL5S2yu1dffyMcMVi9E/Q2HCTcez5OvOllgOtkNYHSv9pnrMRuws3u87+hNT\nZwIDAQAB\n-----END PUBLIC KEY-----`,
} as const;

function resolveFinikEnvironment(value: string | undefined): 'beta' | 'production' {
  const normalized = value?.trim().toLowerCase() || 'beta';
  if (['beta', 'test', 'testing', 'sandbox', 'development', 'dev'].includes(normalized)) return 'beta';
  if (['production', 'prod', 'live'].includes(normalized)) return 'production';
  throw new BadRequestException('Finik environment is not configured');
}

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
  ) {}

  async createFinikPayment(orderId: string, userId: string, locale: 'ru' | 'ky') {
    let order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new NotFoundException('Order not found');
    if (order.status !== 'PENDING') throw new BadRequestException('Order is not eligible for payment');
    if (order.currency !== 'KGS' || Number(order.total) <= 0) {
      throw new BadRequestException('Order currency or total is not supported');
    }

    const now = new Date();
    await this.prisma.$transaction(async (tx) => {
      const expired = await tx.payment.findMany({
        where: { orderId, provider: PaymentProvider.FINIK, status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] }, expiresAt: { lte: now } },
        select: { providerPaymentId: true },
      });
      if (!expired.length) return;
      const expiredIds = expired.flatMap((payment) => payment.providerPaymentId ? [payment.providerPaymentId] : []);
      await tx.payment.updateMany({
        where: { orderId, provider: PaymentProvider.FINIK, status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] }, expiresAt: { lte: now } },
        data: { status: PaymentStatus.CANCELLED, failureReason: 'Payment link expired' },
      });
      await tx.order.updateMany({ where: { id: orderId, activePaymentId: { in: expiredIds } }, data: { activePaymentId: null } });
    });
    order = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order || order.status !== 'PENDING') throw new BadRequestException('Order is not eligible for payment');
    const latestFinikPayment = await this.prisma.payment.findFirst({
      where: { orderId, provider: PaymentProvider.FINIK },
      orderBy: { createdAt: 'desc' },
    });
    if (latestFinikPayment?.status === PaymentStatus.CANCELLED && latestFinikPayment.failureReason === 'Payment link expired') {
      throw new BadRequestException('Payment status must be confirmed by the store before another attempt');
    }
    const active = order.activePaymentId
      ? await this.prisma.payment.findUnique({ where: { providerPaymentId: order.activePaymentId } })
      : null;
    if (active) {
      const url = this.readPaymentUrl(active.metadata);
      if ((active.status === PaymentStatus.PENDING || active.status === PaymentStatus.PROCESSING) && active.expiresAt && active.expiresAt > now && url) {
        return { paymentId: active.providerPaymentId, paymentUrl: url };
      }
      throw new BadRequestException('An order payment is already being prepared');
    }
    if (await this.prisma.payment.findFirst({ where: { orderId, status: PaymentStatus.COMPLETED } })) {
      throw new BadRequestException('Order has already been paid');
    }

    const env = resolveFinikEnvironment(this.config.get<string>('FINIK_ENV'));
    const apiKey = this.config.get<string>('FINIK_API_KEY')?.trim();
    const privateKey = this.config.get<string>('FINIK_PRIVATE_KEY')?.replace(/\\n/g, '\n').trim();
    const accountId = this.config.get<string>('FINIK_ACCOUNT_ID')?.trim();
    if (!apiKey || !privateKey || !accountId) throw new BadGatewayException('Finik is not configured');

    const siteUrl = this.config.get<string>('NEXT_PUBLIC_SITE_URL') || this.config.get<string>('FRONTEND_URL');
    if (!siteUrl || new URL(siteUrl).protocol !== 'https:') {
      throw new BadGatewayException('Payment service is not available');
    }
    const baseUrl = env === 'beta' ? 'https://beta.api.acquiring.averspay.kg' : 'https://api.acquiring.averspay.kg';
    const paymentId = randomUUID();
    const orderTotal = Number(order.total);
    const body: Record<string, unknown> = {
      Amount: orderTotal,
      Currency: 'KGS',
      CardType: 'FINIK_QR',
      PaymentId: paymentId,
      RedirectUrl: `${siteUrl.replace(/\/$/, '')}/payment/success?paymentId=${encodeURIComponent(paymentId)}`,
      Lang: locale,
      Data: {
        accountId,
        name_en: 'AK KAGAZ',
        webhookUrl: `${siteUrl.replace(/\/$/, '')}/api/payments/webhook/finik`,
        description: `Order ${order.orderNumber}`,
        startDate: now.getTime(),
        endDate: now.getTime() + 30 * 60 * 1000,
      },
    };

    const timestamp = Date.now().toString();
    const host = new URL(baseUrl).host;
    const signature = signFinikRequest({
      httpMethod: 'POST',
      path: '/v1/payment',
      headers: { Host: host, 'x-api-key': apiKey, 'x-api-timestamp': timestamp },
      queryStringParameters: null,
      body,
    }, privateKey);

    const reservation = await this.prisma.order.updateMany({
      where: { id: orderId, userId, status: 'PENDING', activePaymentId: null },
      data: { activePaymentId: paymentId },
    });
    if (reservation.count !== 1) {
      const latest = await this.prisma.order.findFirst({ where: { id: orderId, userId } });
      const existing = latest?.activePaymentId
        ? await this.prisma.payment.findUnique({ where: { providerPaymentId: latest.activePaymentId } })
        : null;
      const url = this.readPaymentUrl(existing?.metadata ?? null);
      if (existing && url) return { paymentId: existing.providerPaymentId, paymentUrl: url };
      throw new BadRequestException('An order payment is already being prepared');
    }

    let payment;
    try {
      payment = await this.prisma.payment.create({
        data: {
          orderId,
          provider: PaymentProvider.FINIK,
          method: PaymentMethod.ONLINE_TRANSFER,
          amount: orderTotal,
          currency: 'KGS',
          status: PaymentStatus.PROCESSING,
          providerPaymentId: paymentId,
          expiresAt: new Date(now.getTime() + 30 * 60 * 1000),
          transactions: { create: { type: TransactionType.AUTHORIZATION, amount: orderTotal, currency: 'KGS', status: PaymentStatus.PROCESSING } },
        },
      });
    } catch (error) {
      await this.prisma.order.updateMany({ where: { id: orderId, activePaymentId: paymentId }, data: { activePaymentId: null } });
      throw error;
    }

    let response: Response;
    try {
      response = await fetch(`${baseUrl}/v1/payment`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', host, 'x-api-key': apiKey, 'x-api-timestamp': timestamp, signature },
        body: JSON.stringify(body),
        redirect: 'manual',
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      this.logger.warn(`Finik request did not return a definitive response for payment ${payment.id}`);
      throw new BadGatewayException('Payment provider is temporarily unavailable');
    }

    const location = response.headers.get('location');
    if (response.status !== 302 || !location || new URL(location).origin !== 'https://qr.finik') {
      await this.prisma.$transaction([
        this.prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.FAILED, failedAt: new Date(), failureReason: 'Provider rejected payment initialization' } }),
        this.prisma.order.updateMany({ where: { id: orderId, activePaymentId: paymentId }, data: { activePaymentId: null } }),
      ]);
      this.logger.warn(`Finik rejected payment initialization (${response.status}) for payment ${payment.id}`);
      throw new BadGatewayException('Payment provider could not prepare the payment');
    }

    await this.prisma.$transaction([
      this.prisma.payment.update({ where: { id: payment.id }, data: { status: PaymentStatus.PENDING, metadata: JSON.stringify({ paymentUrl: location }) } }),
      this.prisma.paymentTransaction.updateMany({ where: { paymentId: payment.id, type: TransactionType.AUTHORIZATION }, data: { status: PaymentStatus.PENDING } }),
    ]);
    return { paymentId, paymentUrl: location };
  }

  async getPublicStatus(paymentId: string) {
    let payment = await this.prisma.payment.findUnique({
      where: { providerPaymentId: paymentId },
      select: { id: true, providerPaymentId: true, orderId: true, order: { select: { orderNumber: true } }, amount: true, currency: true, status: true, completedAt: true, expiresAt: true, failureReason: true },
    });
    if (!payment) throw new NotFoundException('Payment not found');
    if ((payment.status === PaymentStatus.PENDING || payment.status === PaymentStatus.PROCESSING) && payment.expiresAt && payment.expiresAt <= new Date()) {
      const expiredUpdate = await this.prisma.payment.updateMany({
        where: { id: payment.id, status: { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] }, expiresAt: { lte: new Date() } },
        data: { status: PaymentStatus.CANCELLED, failureReason: 'Payment link expired' },
      });
      if (expiredUpdate.count > 0 && payment.providerPaymentId) {
        await this.prisma.order.updateMany({ where: { id: payment.orderId, activePaymentId: payment.providerPaymentId }, data: { activePaymentId: null } });
      }
      payment = await this.prisma.payment.findUnique({
        where: { providerPaymentId: paymentId },
        select: { id: true, providerPaymentId: true, orderId: true, order: { select: { orderNumber: true } }, amount: true, currency: true, status: true, completedAt: true, expiresAt: true, failureReason: true },
      });
      if (!payment) throw new NotFoundException('Payment not found');
    }
    return { paymentId: payment.providerPaymentId, orderId: payment.orderId, orderNumber: payment.order.orderNumber, amount: Number(payment.amount), currency: payment.currency, status: payment.status, completedAt: payment.completedAt };
  }

  async handleFinikWebhook(
    body: FinikWebhook,
    headers: Record<string, string | string[] | undefined>,
    host: string,
    path: string,
    query: Record<string, string | string[] | undefined>,
  ) {
    const normalizedHeaders = Object.fromEntries(Object.entries(headers).flatMap(([key, value]) =>
      value === undefined ? [] : [[key.toLowerCase(), Array.isArray(value) ? value.join(',') : value]],
    ));
    const signature = normalizedHeaders.signature;
    const timestamp = normalizedHeaders['x-api-timestamp'];
    let env: 'beta' | 'production';
    try {
      env = resolveFinikEnvironment(this.config.get<string>('FINIK_ENV'));
    } catch {
      throw new UnauthorizedException('Invalid payment notification');
    }
    if (!signature || !timestamp) throw new UnauthorizedException('Invalid payment notification');
    const timestampValue = Number(timestamp);
    if (!Number.isFinite(timestampValue) || Math.abs(Date.now() - timestampValue) > 5 * 60 * 1000) {
      throw new UnauthorizedException('Invalid payment notification');
    }

    const requestHeaders = Object.fromEntries(Object.entries(normalizedHeaders).map(([key, value]) => [key === 'host' ? 'Host' : key, value]));
    const queryStringParameters = Object.fromEntries(Object.entries(query).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]));
    const verified = verifyFinikRequest({
      httpMethod: 'POST',
      path,
      headers: requestHeaders,
      queryStringParameters,
      body: body as Record<string, unknown>,
    }, FINIK_PUBLIC_KEYS[env], signature);
    if (!verified) throw new UnauthorizedException('Invalid payment notification');

    const paymentId = typeof body.fields?.paymentId === 'string' ? body.fields.paymentId : '';
    const transactionId = typeof body.transactionId === 'string' ? body.transactionId : '';
    const eventId = typeof body.id === 'string' ? body.id : transactionId;
    const normalizedStatus = typeof body.status === 'string' ? body.status.toLowerCase() : '';
    if (!eventId) throw new BadRequestException('Unsupported payment notification');
    if (normalizedStatus !== 'success') {
      const linkedPayment = paymentId
        ? await this.prisma.payment.findUnique({ where: { providerPaymentId: paymentId }, select: { id: true } })
        : null;
      try {
        await this.prisma.paymentWebhookEvent.create({
          data: { paymentId: linkedPayment?.id, provider: PaymentProvider.FINIK, providerEventId: eventId, eventType: 'unrecognized_status', status: 'COMPLETED', payload: JSON.stringify(body), processedAt: new Date() },
        });
      } catch (error) {
        if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { success: true };
        throw error;
      }
      return { success: true };
    }
    if (!paymentId || !transactionId) throw new BadRequestException('Unsupported payment notification');

    const payment = await this.prisma.payment.findUnique({ where: { providerPaymentId: paymentId }, include: { order: true } });
    if (!payment || payment.provider !== PaymentProvider.FINIK) throw new NotFoundException('Payment not found');
    const receivedAmount = Number(body.amount ?? body.fields?.amount);
    const fieldAmount = Number(body.fields?.amount ?? body.amount);
    const transactionTime = Number(body.transactionDate);
    const transactionIsInWindow = Number.isFinite(transactionTime) && transactionTime >= payment.createdAt.getTime() && (!payment.expiresAt || transactionTime <= payment.expiresAt.getTime());
    if (!Number.isFinite(receivedAmount) || receivedAmount !== Number(payment.amount) || fieldAmount !== Number(payment.amount) || (body.currency !== undefined && body.currency !== 'KGS') || !transactionIsInWindow || payment.currency !== payment.order.currency || payment.currency !== 'KGS') {
      throw new BadRequestException('Payment amount or currency does not match the order');
    }

    try {
      await this.prisma.$transaction(async (tx) => {
        const priorEvent = await tx.paymentWebhookEvent.findUnique({ where: { providerEventId: eventId } });
        if (priorEvent) return;
        await tx.paymentWebhookEvent.create({
          data: { paymentId: payment.id, provider: PaymentProvider.FINIK, providerEventId: eventId, eventType: 'success', status: 'COMPLETED', payload: JSON.stringify(body), processedAt: new Date() },
        });
        if (payment.status === PaymentStatus.COMPLETED) return;
        const expiredCancellation = payment.status === PaymentStatus.CANCELLED && payment.failureReason === 'Payment link expired';
        if (payment.status !== PaymentStatus.PENDING && payment.status !== PaymentStatus.PROCESSING && !expiredCancellation) {
          throw new BadRequestException('Payment is no longer payable');
        }
        const changed = await tx.payment.updateMany({
          where: { id: payment.id, status: expiredCancellation ? PaymentStatus.CANCELLED : { in: [PaymentStatus.PENDING, PaymentStatus.PROCESSING] } },
          data: { status: PaymentStatus.COMPLETED, providerTransactionId: transactionId, completedAt: new Date() },
        });
        if (changed.count === 0) return;
        await tx.paymentTransaction.create({
          data: { paymentId: payment.id, type: TransactionType.CAPTURE, amount: payment.amount, currency: payment.currency, providerTransactionId: transactionId, status: PaymentStatus.COMPLETED, metadata: JSON.stringify({ finikEventId: eventId }) },
        });
        if (payment.order.status === 'PENDING') {
          await tx.order.update({ where: { id: payment.orderId }, data: { status: 'CONFIRMED', activePaymentId: null } });
          await tx.orderStatusHistory.create({ data: { orderId: payment.orderId, status: 'CONFIRMED', notes: 'Payment confirmed by Finik' } });
        }
      });
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') return { success: true };
      throw error;
    }
    return { success: true };
  }

  async create(dto: { orderId: string; provider?: PaymentProvider; method?: PaymentMethod }) {
    if (dto.provider === PaymentProvider.FINIK) throw new BadRequestException('Use the Finik payment flow');
    throw new BadRequestException('Payment provider is not available');
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({ where: { id }, include: { order: { include: { user: { select: { id: true } } } }, transactions: { orderBy: { createdAt: 'desc' } }, webhookEvents: { orderBy: { createdAt: 'desc' }, take: 10 } } });
    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findByOrder(orderId: string) {
    return this.prisma.payment.findMany({ where: { orderId }, include: { transactions: { orderBy: { createdAt: 'desc' } } }, orderBy: { createdAt: 'desc' } });
  }

  private readPaymentUrl(metadata: string | null): string | null {
    if (!metadata) return null;
    try {
      const url = JSON.parse(metadata).paymentUrl;
      return typeof url === 'string' && new URL(url).origin === 'https://qr.finik' ? url : null;
    } catch { return null; }
  }
}
