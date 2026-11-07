import { Controller, Get, Post, Body, Param, UseGuards, HttpCode, HttpStatus, Request, ForbiddenException } from '@nestjs/common';
import { PaymentsService } from './payments.service';
import { CreatePaymentDto, PaymentWebhookDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { PrismaService } from '../common/services/prisma.service';

@Controller('payments')
export class PaymentsController {
  constructor(
    private readonly paymentsService: PaymentsService,
    private readonly prisma: PrismaService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreatePaymentDto, @Request() req: any) {
    // Verify user owns the order
    const order = await this.prisma.order.findUnique({ where: { id: dto.orderId }, select: { userId: true } });
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    if (order.userId !== req.user.userId) {
      throw new ForbiddenException('You can only create payments for your own orders');
    }
    
    return this.paymentsService.create(dto);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  async findOne(@Param('id') id: string, @Request() req: any) {
    const payment = await this.paymentsService.findOne(id);
    
    // Check if user is admin
    const isAdmin = req.user.roles && (req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPER_ADMIN'));
    
    // Regular users can only see their own payments
    if (!isAdmin && payment.order.userId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own payments');
    }
    
    return payment;
  }

  @Get('order/:orderId')
  @UseGuards(JwtAuthGuard)
  async findByOrder(@Param('orderId') orderId: string, @Request() req: any) {
    // Verify user owns the order
    const order = await this.prisma.order.findUnique({ where: { id: orderId }, select: { userId: true } });
    if (!order) {
      throw new ForbiddenException('Order not found');
    }
    
    // Check if user is admin
    const isAdmin = req.user.roles && (req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPER_ADMIN'));
    
    if (!isAdmin && order.userId !== req.user.userId) {
      throw new ForbiddenException('You can only view payments for your own orders');
    }
    
    return this.paymentsService.findByOrder(orderId);
  }

  /**
   * Webhook endpoint for payment providers (STRIPE, PAYPAL, MBANK)
   * This endpoint should NOT require authentication (called by external providers)
   * In production, implement provider signature verification
   */
  @Post('webhook')
  @HttpCode(HttpStatus.OK)
  async handleWebhook(@Body() dto: PaymentWebhookDto) {
    // TODO: In production, verify webhook signature based on provider
    // - STRIPE: verify stripe-signature header
    // - PAYPAL: verify PayPal webhook signature
    // - MBANK: verify MBANK signature

    return this.paymentsService.handleWebhook(dto);
  }

  /**
   * Admin endpoint to manually update payment status
   */
  @Post(':id/status')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN', 'SUPER_ADMIN')
  async updateStatus(
    @Param('id') id: string,
    @Body() body: { status: string; providerTransactionId?: string; failureReason?: string },
  ) {
    return this.paymentsService.updateStatus(
      id,
      body.status as any,
      body.providerTransactionId,
      body.failureReason,
    );
  }
}
