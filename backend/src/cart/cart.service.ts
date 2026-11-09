import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async getSessionCart(sessionId: string) {
    this.validateSessionId(sessionId);
    return this.getOrCreateCart(undefined, sessionId);
  }

  async addSessionItem(sessionId: string, dto: AddToCartDto) {
    this.validateSessionId(sessionId);
    return this.addItem(dto, undefined, sessionId);
  }

  async updateSessionItem(sessionId: string, itemId: string, dto: UpdateCartItemDto) {
    const cartId = await this.getSessionCartId(sessionId);
    return this.updateItem(cartId, itemId, dto);
  }

  async removeSessionItem(sessionId: string, itemId: string) {
    const cartId = await this.getSessionCartId(sessionId);
    return this.removeItem(cartId, itemId);
  }

  async getOrCreateCart(userId?: string, sessionId?: string) {
    if (!userId && !sessionId) throw new BadRequestException('User ID or session ID required');
    
    let cart = await this.prisma.cart.findFirst({
      where: userId ? { userId, status: 'ACTIVE' } : { sessionId, status: 'ACTIVE' },
      include: { items: { include: { product: { include: { translations: true } } } } },
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, sessionId, status: 'ACTIVE', expiresAt: sessionId ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null },
        include: { items: { include: { product: { include: { translations: true } } } } },
      });
    }

    return this.calculateCartTotals(cart);
  }

  async addItem(dto: AddToCartDto, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    // Get current date for price validation
    const now = new Date();
    
    // Find product with active price that is effective at current time
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        prices: {
          where: {
            isActive: true,
          isEstimate: false,
            effectiveFrom: { lte: now }, // Price must have started
            OR: [
              { effectiveUntil: null }, // No end date (permanent)
              { effectiveUntil: { gte: now } }, // Or not expired yet
            ],
          },
          orderBy: { effectiveFrom: 'desc' }, // Get most recent price first
          take: 1,
        },
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'ACTIVE') {
      throw new BadRequestException('Product is not available for purchase');
    }
    if (product.prices.length === 0) {
      throw new BadRequestException('Product has no active price available at this time');
    }

    const price = Number(product.prices[0].sellingPrice);
    const subtotal = price * dto.quantity;

    const existing = await this.prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId: dto.productId } } });

    return this.prisma.$transaction(async (tx: any) => {
      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + dto.quantity, subtotal: Number(existing.subtotal) + subtotal },
        });
      } else {
        await tx.cartItem.create({ data: { cartId: cart.id, productId: dto.productId, quantity: dto.quantity, price, subtotal } });
      }

      const updated = await tx.cart.findUnique({
        where: { id: cart.id },
        include: { items: { include: { product: { include: { translations: true } } } } },
      });
      return this.calculateCartTotals(updated);
    });
  }

  async updateItem(cartId: string, itemId: string, dto: UpdateCartItemDto) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId }, include: { product: true } });
    if (!item || item.cartId !== cartId) throw new NotFoundException('Cart item not found');

    const subtotal = Number(item.price) * dto.quantity;

    return this.prisma.$transaction(async (tx: any) => {
      await tx.cartItem.update({ where: { id: itemId }, data: { quantity: dto.quantity, subtotal } });
      const cart = await tx.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: { include: { translations: true } } } } } });
      return this.calculateCartTotals(cart);
    });
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cartId) throw new NotFoundException('Cart item not found');

    return this.prisma.$transaction(async (tx: any) => {
      await tx.cartItem.delete({ where: { id: itemId } });
      const cart = await tx.cart.findUnique({ where: { id: cartId }, include: { items: { include: { product: { include: { translations: true } } } } } });
      return this.calculateCartTotals(cart);
    });
  }

  async clearCart(cartId: string) {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
    return this.calculateCartTotals(cart);
  }

  private calculateCartTotals(cart: any) {
    const totalItems = cart.items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const subtotal = cart.items.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);
    return { ...cart, totalItems, subtotal };
  }

  private async getSessionCartId(sessionId: string): Promise<string> {
    this.validateSessionId(sessionId);
    const cart = await this.prisma.cart.findFirst({
      where: { sessionId, status: 'ACTIVE' },
      select: { id: true },
    });
    if (!cart) throw new NotFoundException('Cart not found');
    return cart.id;
  }

  private validateSessionId(sessionId: string) {
    if (!/^session_[a-zA-Z0-9_-]{10,64}$/.test(sessionId)) {
      throw new BadRequestException('Invalid cart session');
    }
  }
}
