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
      include: this.cartItemsInclude(),
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { userId, sessionId, status: 'ACTIVE', expiresAt: sessionId ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : null },
        include: this.cartItemsInclude(),
      });
    }

    return this.calculateCartTotals(cart);
  }

  async addItem(dto: AddToCartDto, userId?: string, sessionId?: string) {
    const cart = await this.getOrCreateCart(userId, sessionId);
    
    // Get current date for price validation
    const now = new Date();
    
    // Prefer a confirmed current price, but use a saved estimate when no confirmed price exists.
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
      include: {
        prices: {
          where: {
            effectiveFrom: { lte: now }, // Price must have started
            OR: [
              { isActive: true, isEstimate: false, effectiveUntil: null },
              { isActive: true, isEstimate: false, effectiveUntil: { gte: now } },
              { isEstimate: true, effectiveUntil: null },
              { isEstimate: true, effectiveUntil: { gte: now } },
            ],
          },
          orderBy: { effectiveFrom: 'desc' }, // Get most recent price first
          take: 1,
        },
        variants: dto.variantId ? { where: { id: dto.variantId } } : undefined,
      },
    });

    if (!product) throw new NotFoundException('Product not found');
    if (product.status !== 'ACTIVE') {
      throw new BadRequestException('Product is not available for purchase');
    }

    // If variantId is provided, check if it exists and get its price
    let price: number;
    if (dto.variantId) {
      const variant = product.variants?.find(v => v.id === dto.variantId);
      if (!variant) throw new NotFoundException('Variant not found');
      if (!variant.isActive) throw new BadRequestException('Variant is not available');
      
      // Use variant price if set, otherwise use product price
      if (variant.price) {
        price = Number(variant.price);
      } else {
        const selectedPrice = product.prices.find((candidate) => candidate.isActive && !candidate.isEstimate)
          ?? product.prices.find((candidate) => candidate.isEstimate);
        if (!selectedPrice) {
          throw new BadRequestException('Product has no current price or estimate available');
        }
        price = Number(selectedPrice.sellingPrice);
      }
    } else {
      const selectedPrice = product.prices.find((candidate) => candidate.isActive && !candidate.isEstimate)
        ?? product.prices.find((candidate) => candidate.isEstimate);
      if (!selectedPrice) {
        throw new BadRequestException('Product has no current price or estimate available');
      }
      price = Number(selectedPrice.sellingPrice);
    }

    // Check if item with same product and variant already exists
    const existingWhere = dto.variantId
      ? { cartId_productId_variantId: { cartId: cart.id, productId: dto.productId, variantId: dto.variantId } }
      : { cartId_productId_variantId: { cartId: cart.id, productId: dto.productId, variantId: null } };

    const existing = await this.prisma.cartItem.findUnique({ where: existingWhere });

    return this.prisma.$transaction(async (tx: any) => {
      if (existing) {
        await tx.cartItem.update({
          where: { id: existing.id },
          data: {
            quantity: existing.quantity + dto.quantity,
            price,
            subtotal: price * (existing.quantity + dto.quantity),
          },
        });
      } else {
        await tx.cartItem.create({ 
          data: { 
            cartId: cart.id, 
            productId: dto.productId, 
            variantId: dto.variantId,
            quantity: dto.quantity, 
            price, 
            subtotal: price * dto.quantity 
          } 
        });
      }

      const updated = await tx.cart.findUnique({
        where: { id: cart.id },
        include: this.cartItemsInclude(),
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
      const cart = await tx.cart.findUnique({ where: { id: cartId }, include: this.cartItemsInclude() });
      return this.calculateCartTotals(cart);
    });
  }

  async removeItem(cartId: string, itemId: string) {
    const item = await this.prisma.cartItem.findUnique({ where: { id: itemId } });
    if (!item || item.cartId !== cartId) throw new NotFoundException('Cart item not found');

    return this.prisma.$transaction(async (tx: any) => {
      await tx.cartItem.delete({ where: { id: itemId } });
      const cart = await tx.cart.findUnique({ where: { id: cartId }, include: this.cartItemsInclude() });
      return this.calculateCartTotals(cart);
    });
  }

  async clearCart(cartId: string) {
    await this.prisma.cartItem.deleteMany({ where: { cartId } });
    const cart = await this.prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
    return this.calculateCartTotals(cart);
  }

  private calculateCartTotals(cart: any) {
    const now = Date.now();
    const items = cart.items.map((item: any) => {
      const confirmedAtStoredPrice = item.product?.prices?.some((price: any) =>
        price.isActive && !price.isEstimate && Number(price.sellingPrice) === Number(item.price)
        && new Date(price.effectiveFrom).getTime() <= now
        && (!price.effectiveUntil || new Date(price.effectiveUntil).getTime() >= now),
      );
      return { ...item, priceIsEstimate: !confirmedAtStoredPrice };
    });
    const totalItems = items.reduce((sum: number, item: any) => sum + item.quantity, 0);
    const subtotal = items.reduce((sum: number, item: any) => sum + Number(item.subtotal), 0);
    return { ...cart, items, totalItems, subtotal };
  }

  private cartItemsInclude(now = new Date()) {
    return {
      items: {
        include: {
          product: {
            include: {
              translations: true,
              variants: true,
              prices: {
                where: {
                  AND: [
                    { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
                    { effectiveFrom: { lte: now } },
                    { OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }] },
                  ],
                },
                select: { sellingPrice: true, currency: true, isActive: true, isEstimate: true, effectiveFrom: true, effectiveUntil: true },
              },
            },
          },
          variant: true,
        },
      },
    };
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
