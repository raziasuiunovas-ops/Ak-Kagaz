import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { PaymentStatus } from '@prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../common/services/prisma.service';
import { PaymentsService } from './payments.service';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService, private readonly prisma: PrismaService) {}

  @Post('finik')
  @UseGuards(JwtAuthGuard)
  async createFinik(@Body() body: { orderId?: string; locale?: string }, @Request() req: any) {
    if (typeof body.orderId !== 'string' || !body.orderId) throw new BadRequestException('Order is required');
    const locale = body.locale === 'ky' ? 'ky' : 'ru';
    return this.paymentsService.createFinikPayment(body.orderId, req.user.userId, locale);
  }

  @Get('public/:paymentId')
  async getPublicStatus(@Param('paymentId') paymentId: string) {
    return this.paymentsService.getPublicStatus(paymentId);
  }

  @Post('webhook/finik')
  @HttpCode(HttpStatus.OK)
  async handleFinikWebhook(@Request() req: any) {
    return this.paymentsService.handleFinikWebhook(
      req.body,
      req.headers,
      req.headers.host,
      (req.originalUrl as string).split('?')[0],
      req.query,
    );
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    const payment = await this.paymentsService.findOne(id);
    const isAdmin = req.user.roles?.some((role: string) => ['ADMIN', 'SUPER_ADMIN'].includes(role));
    if (!isAdmin && payment.order.userId !== req.user.userId) throw new ForbiddenException('You can only view your own payments');
    return payment;
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async findByOrder(@Param('orderId') orderId: string, @Request() req: any) {
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { userId: true } });
    if (!order) throw new ForbiddenException('Order not found');
    const isAdmin = req.user.roles?.some((role: string) => ['ADMIN', 'SUPER_ADMIN'].includes(role));
    if (!isAdmin && order.userId !== req.user.userId) throw new ForbiddenException('You can only view payments for your own orders');
    return this.paymentsService.findByOrder(orderId);
  }

  @Post(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateStatus(@Param('id') id: string, @Body() body: { status?: string; failureReason?: string }) {
    if (body.status !== PaymentStatus.FAILED && body.status !== PaymentStatus.CANCELLED) {
      throw new BadRequestException('Successful payment status is set only by a verified Finik notification');
    }
    const payment = await this.prisma.payment.findUnique({ where: { id } });
    if (!payment) throw new BadRequestException('Payment not found');
    return this.prisma.$transaction(async (tx) => {
      const updated = await tx.payment.update({ where: { id }, data: { status: body.status as PaymentStatus, failedAt: new Date(), failureReason: body.failureReason } });
      if (payment.providerPaymentId) {
        await tx.order.updateMany({ where: { id: payment.orderId, activePaymentId: payment.providerPaymentId }, data: { activePaymentId: null } });
      }
      return updated;
    });
  }
}
