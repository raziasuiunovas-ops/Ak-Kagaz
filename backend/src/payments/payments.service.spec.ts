import { BadRequestException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../common/services/prisma.service';
import { PaymentsService } from './payments.service';

describe('PaymentsService Finik protections', () => {
  const prisma = {
    order: { findFirst: jest.fn(), updateMany: jest.fn() },
    payment: { updateMany: jest.fn(), findFirst: jest.fn(), findUnique: jest.fn(), create: jest.fn() },
    paymentWebhookEvent: { create: jest.fn(), findUnique: jest.fn() },
    paymentTransaction: { create: jest.fn(), updateMany: jest.fn() },
    orderStatusHistory: { create: jest.fn() },
    $transaction: jest.fn((callback) => callback(prisma)),
  } as unknown as PrismaService;
  const config = { get: jest.fn() } as unknown as ConfigService;
  const service = new PaymentsService(prisma, config);

  beforeEach(() => jest.clearAllMocks());

  describe('Payment creation', () => {
    it('does not create a payment for an order outside the caller account', async () => {
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue(null as never);

      await expect(service.createFinikPayment('order-id', 'user-id', 'ru')).rejects.toBeInstanceOf(NotFoundException);
      expect(prisma.payment.updateMany).not.toHaveBeenCalled();
    });

    it('does not accept an order that has already moved past pending', async () => {
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue({
        id: 'order-id', userId: 'user-id', status: 'CONFIRMED', currency: 'KGS', total: 500, activePaymentId: null,
      } as never);

      await expect(service.createFinikPayment('order-id', 'user-id', 'ru')).rejects.toBeInstanceOf(BadRequestException);
      expect(prisma.payment.updateMany).not.toHaveBeenCalled();
    });

    it('rejects order with invalid currency', async () => {
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue({
        id: 'order-id', userId: 'user-id', status: 'PENDING', currency: 'USD', total: 500, activePaymentId: null,
      } as never);

      await expect(service.createFinikPayment('order-id', 'user-id', 'ru')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('rejects order with zero or negative amount', async () => {
      jest.spyOn(prisma.order, 'findFirst').mockResolvedValue({
        id: 'order-id', userId: 'user-id', status: 'PENDING', currency: 'KGS', total: 0, activePaymentId: null,
      } as never);

      await expect(service.createFinikPayment('order-id', 'user-id', 'ru')).rejects.toBeInstanceOf(BadRequestException);
    });
  });

  describe('Webhook validation', () => {
    it('rejects webhook requests with invalid Finik signatures before database writes', async () => {
      const timestamp = Date.now().toString();
      const invalidSignature = Buffer.alloc(256).toString('base64');

      await expect(service.handleFinikWebhook(
        { status: 'success' },
        { host: 'ak-kagaz.vercel.app', signature: invalidSignature, 'x-api-timestamp': timestamp },
        'ak-kagaz.vercel.app',
        '/api/payments/webhook/finik',
        {},
      )).rejects.toBeInstanceOf(UnauthorizedException);
      expect(prisma.paymentWebhookEvent.create).not.toHaveBeenCalled();
    });

    it('rejects webhook with expired timestamp', async () => {
      const expiredTimestamp = (Date.now() - 10 * 60 * 1000).toString(); // 10 minutes ago
      jest.spyOn(config, 'get').mockReturnValue('beta');

      await expect(service.handleFinikWebhook(
        { status: 'success' },
        { host: 'test.com', signature: 'sig', 'x-api-timestamp': expiredTimestamp },
        'test.com',
        '/webhook',
        {},
      )).rejects.toThrow(UnauthorizedException);
    });

    it('rejects webhook with missing timestamp header', async () => {
      jest.spyOn(config, 'get').mockReturnValue('beta');

      await expect(service.handleFinikWebhook(
        { status: 'success' },
        { host: 'test.com', signature: 'sig' },
        'test.com',
        '/webhook',
        {},
      )).rejects.toThrow(UnauthorizedException);
    });

    it('rejects webhook with missing signature header', async () => {
      jest.spyOn(config, 'get').mockReturnValue('beta');

      await expect(service.handleFinikWebhook(
        { status: 'success' },
        { host: 'test.com', 'x-api-timestamp': Date.now().toString() },
        'test.com',
        '/webhook',
        {},
      )).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('Public status checks', () => {
    it('marks expired pending payments as cancelled on status check', async () => {
      const expiredDate = new Date(Date.now() - 60 * 1000);
      jest.spyOn(prisma.payment, 'findUnique').mockResolvedValueOnce({
        id: 'payment-1',
        providerPaymentId: 'finik-123',
        orderId: 'order-1',
        order: { orderNumber: 'ORD-001' },
        amount: 500,
        currency: 'KGS',
        status: 'PENDING',
        completedAt: null,
        expiresAt: expiredDate,
        failureReason: null,
      } as never).mockResolvedValueOnce({
        id: 'payment-1',
        providerPaymentId: 'finik-123',
        orderId: 'order-1',
        order: { orderNumber: 'ORD-001' },
        amount: 500,
        currency: 'KGS',
        status: 'CANCELLED',
        completedAt: null,
        expiresAt: expiredDate,
        failureReason: 'Payment link expired',
      } as never);
      jest.spyOn(prisma.payment, 'updateMany').mockResolvedValue({ count: 1 } as never);
      jest.spyOn(prisma.order, 'updateMany').mockResolvedValue({ count: 1 } as never);

      const result = await service.getPublicStatus('finik-123');

      expect(result.status).toBe('CANCELLED');
      expect(prisma.payment.updateMany).toHaveBeenCalledWith({
        where: { id: 'payment-1', status: { in: ['PENDING', 'PROCESSING'] }, expiresAt: { lte: expect.any(Date) } },
        data: { status: 'CANCELLED', failureReason: 'Payment link expired' },
      });
    });
  });
});
