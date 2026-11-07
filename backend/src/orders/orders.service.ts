import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { WarehouseService } from '../warehouse/warehouse.service';

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly warehouseService: WarehouseService,
  ) {}

  async create(dto: CreateOrderDto, userId: string) {
    return this.prisma.$transaction(async (tx: any) => {
      // Get active cart with lock (use findFirst with status check inside transaction)
      const cart = await tx.cart.findFirst({
        where: { userId, status: 'ACTIVE' },
        include: { items: { include: { product: true } } },
      });

      if (!cart || cart.items.length === 0) {
        throw new BadRequestException('Cart is empty');
      }

      // Double-check cart wasn't already converted (race condition protection)
      if (cart.status !== 'ACTIVE') {
        throw new BadRequestException('Cart has already been converted to an order');
      }

      // Validate fulfillment type requirements
      if (dto.fulfillmentType === 'DELIVERY' && !dto.deliveryAddressId) {
        throw new BadRequestException('Delivery address required for delivery orders');
      }
      if (dto.fulfillmentType === 'PICKUP' && !dto.pickupLocationId) {
        throw new BadRequestException('Pickup location required for pickup orders');
      }

      // Calculate minimum order (400 KGS)
      const subtotal = cart.items.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);
      if (subtotal < 400) {
        throw new BadRequestException('Minimum order amount is 400 KGS');
      }

      // Check stock availability BEFORE creating order
      const stockItems = cart.items.map((item: any) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

      const insufficientStock = await this.warehouseService.checkAvailability(stockItems);
      if (insufficientStock.length > 0) {
        const details = insufficientStock
          .map((s) => `Product ${s.productId}: requested ${s.requested}, available ${s.available}`)
          .join('; ');
        throw new BadRequestException(`Insufficient stock: ${details}`);
      }

      const deliveryFee = dto.fulfillmentType === 'DELIVERY' ? 50 : 0;
      const total = subtotal + deliveryFee;

      // Generate order number
      const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Mark cart as converted FIRST (prevents race condition)
      await tx.cart.update({ 
        where: { id: cart.id }, 
        data: { status: 'CONVERTED', convertedAt: new Date() } 
      });

      // Create order
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId,
          status: 'PENDING',
          fulfillmentType: dto.fulfillmentType,
          deliveryAddressId: dto.deliveryAddressId,
          billingAddressId: dto.billingAddressId || dto.deliveryAddressId,
          pickupLocationId: dto.pickupLocationId,
          subtotal,
          deliveryFee,
          total,
          notes: dto.notes,
        },
      });

      // Create order items
      await tx.orderItem.createMany({
        data: cart.items.map((item: any) => ({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          unitPrice: item.price,
          subtotal: item.subtotal,
        })),
      });

      // Reserve stock for order (CRITICAL: within same transaction)
      await this.warehouseService.reserveStockForOrder(order.id, stockItems, tx);

      // Create status history
      await tx.orderStatusHistory.create({
        data: { orderId: order.id, status: 'PENDING', notes: 'Order created', createdBy: userId },
      });

      return tx.order.findUnique({
        where: { id: order.id },
        include: {
          items: { include: { product: { include: { translations: true } } } },
          deliveryAddress: true,
          billingAddress: true,
          pickupLocation: true,
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });
    });
  }

  async findAll(page = 1, limit = 20, userId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (userId) where.userId = userId;
    if (status) where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        include: {
          items: { include: { product: { include: { translations: true } } } },
          user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
          deliveryAddress: true,
          _count: { select: { items: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.order.count({ where }),
    ]);

    return { data: orders, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOne(id: string) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        items: { include: { product: { include: { translations: true } } } },
        user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } },
        deliveryAddress: true,
        billingAddress: true,
        pickupLocation: true,
        statusHistory: { orderBy: { createdAt: 'desc' } },
        payments: true,
        delivery: true,
      },
    });

    if (!order) throw new NotFoundException('Order not found');
    return order;
  }

  async updateStatus(id: string, dto: UpdateOrderStatusDto, userId: string) {
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');

    return this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.order.update({
        where: { id },
        data: { status: dto.status, ...(dto.status === 'CANCELLED' && { cancelledAt: new Date(), cancelReason: dto.notes }) },
        include: {
          items: { include: { product: { include: { translations: true } } } },
          statusHistory: { orderBy: { createdAt: 'desc' } },
        },
      });

      await tx.orderStatusHistory.create({
        data: { orderId: id, status: dto.status, notes: dto.notes, createdBy: userId },
      });

      return updated;
    });
  }

  async cancel(id: string, reason: string, userId: string) {
    return this.updateStatus(id, { status: 'CANCELLED', notes: reason }, userId);
  }
}
