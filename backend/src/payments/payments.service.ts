import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreatePaymentDto, PaymentWebhookDto } from './dto';

@Injectable()
export class PaymentsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePaymentDto) {
    // Verify order exists
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId } });
    if (!order) throw new NotFoundException('Order not found');

    // Check if payment already exists for this order
    const existingPayment = await this.prisma.payment.findFirst({
      where: { orderId: dto.orderId, status: { in: ['PENDING', 'PROCESSING', 'COMPLETED'] } },
    });

    if (existingPayment) {
      throw new BadRequestException('Payment already exists for this order');
    }

    // Validate amount matches order total
    if (dto.amount !== Number(order.total)) {
      throw new BadRequestException(`Payment amount (${dto.amount}) does not match order total (${order.total})`);
    }

    return this.prisma.payment.create({
      data: {
        orderId: dto.orderId,
        provider: dto.provider,
        method: dto.method,
        amount: dto.amount,
        currency: dto.currency || 'KGS',
        status: 'PENDING',
        metadata: dto.metadata,
      },
      include: {
        order: {
          include: {
            items: { include: { product: { include: { translations: true } } } },
            user: { select: { id: true, email: true } },
          },
        },
      },
    });
  }

  async findOne(id: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: {
        order: {
          include: {
            items: { include: { product: { include: { translations: true } } } },
            user: { select: { id: true, email: true } },
          },
        },
        transactions: { orderBy: { createdAt: 'desc' } },
        webhookEvents: { orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });

    if (!payment) throw new NotFoundException('Payment not found');
    return payment;
  }

  async findByOrder(orderId: string) {
    return this.prisma.payment.findMany({
      where: { orderId },
      include: {
        transactions: { orderBy: { createdAt: 'desc' } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(
    id: string,
    status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED',
    providerTransactionId?: string,
    failureReason?: string,
  ) {
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new NotFoundException('Payment not found');

    return this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.payment.update({
        where: { id },
        data: {
          status,
          providerTransactionId,
          ...(status === 'COMPLETED' && { completedAt: new Date() }),
          ...(status === 'FAILED' && { failedAt: new Date(), failureReason }),
        },
        include: {
          order: true,
          transactions: { orderBy: { createdAt: 'desc' } },
        },
      });

      // If payment completed, update order status to CONFIRMED
      if (status === 'COMPLETED') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'CONFIRMED' },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: 'CONFIRMED',
            notes: 'Payment completed successfully',
          },
        });
      }

      // If payment failed, update order status to PAYMENT_FAILED
      if (status === 'FAILED') {
        await tx.order.update({
          where: { id: payment.orderId },
          data: { status: 'PAYMENT_FAILED' },
        });

        await tx.orderStatusHistory.create({
          data: {
            orderId: payment.orderId,
            status: 'PAYMENT_FAILED',
            notes: failureReason || 'Payment failed',
          },
        });
      }

      return updated;
    });
  }

  async handleWebhook(dto: PaymentWebhookDto) {
    // Log webhook event
    const webhookEvent = await this.prisma.paymentWebhookEvent.create({
      data: {
        paymentId: dto.paymentId,
        provider: dto.provider,
        eventType: dto.eventType,
        status: 'PENDING',
        payload: JSON.stringify(dto.payload),
      },
    });

    try {
      // If paymentId provided, update payment status
      if (dto.paymentId && dto.status) {
        await this.updateStatus(
          dto.paymentId,
          dto.status,
          dto.providerTransactionId,
          dto.payload?.error || dto.payload?.failureReason,
        );
      }

      // Mark webhook as processed
      await this.prisma.paymentWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'COMPLETED', processedAt: new Date() },
      });

      return { success: true, webhookEventId: webhookEvent.id };
    } catch (error: any) {
      // Mark webhook as failed
      await this.prisma.paymentWebhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: 'FAILED', error: error.message },
      });

      throw error;
    }
  }
}
