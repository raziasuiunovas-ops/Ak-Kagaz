import { Injectable, NotFoundException, ConflictException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreatePriceTierDto, UpdatePriceTierDto, CreateProductPriceDto, UpdateProductPriceDto, BulkPriceUpdateDto } from './dto';

@Injectable()
export class PricingService {
  constructor(private readonly prisma: PrismaService) {}

  // PRICE TIERS
  async createTier(dto: CreatePriceTierDto) {
    const existing = await this.prisma.priceTier.findUnique({ where: { name: dto.name } });
    if (existing) throw new ConflictException(`Price tier "${dto.name}" already exists`);

    return this.prisma.priceTier.create({
      data: {
        name: dto.name,
        displayNameRu: dto.displayNameRu,
        displayNameKy: dto.displayNameKy,
        description: dto.description,
        minQuantity: dto.minQuantity ?? 1,
        discountPercent: dto.discountPercent ?? 0,
        isActive: dto.isActive ?? true,
      },
      include: { _count: { select: { prices: true } } },
    });
  }

  async findAllTiers(page = 1, limit = 20, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = isActive !== undefined ? { isActive } : {};
    const [tiers, total] = await Promise.all([
      this.prisma.priceTier.findMany({
        where,
        skip,
        take: limit,
        include: { _count: { select: { prices: true } } },
        orderBy: { minQuantity: 'asc' },
      }),
      this.prisma.priceTier.count({ where }),
    ]);
    return { data: tiers, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOneTier(id: string) {
    const tier = await this.prisma.priceTier.findUnique({
      where: { id },
      include: { prices: { include: { product: { include: { translations: true } } } }, _count: { select: { prices: true } } },
    });
    if (!tier) throw new NotFoundException(`Price tier "${id}" not found`);
    return tier;
  }

  async updateTier(id: string, dto: UpdatePriceTierDto) {
    const existing = await this.prisma.priceTier.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Price tier "${id}" not found`);
    if (dto.name && dto.name !== existing.name) {
      const conflict = await this.prisma.priceTier.findUnique({ where: { name: dto.name } });
      if (conflict) throw new ConflictException(`Price tier "${dto.name}" already exists`);
    }
    return this.prisma.priceTier.update({
      where: { id },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.displayNameRu && { displayNameRu: dto.displayNameRu }),
        ...(dto.displayNameKy && { displayNameKy: dto.displayNameKy }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.minQuantity !== undefined && { minQuantity: dto.minQuantity }),
        ...(dto.discountPercent !== undefined && { discountPercent: dto.discountPercent }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: { _count: { select: { prices: true } } },
    });
  }

  async removeTier(id: string) {
    const tier = await this.prisma.priceTier.findUnique({ where: { id }, include: { prices: true } });
    if (!tier) throw new NotFoundException(`Price tier "${id}" not found`);
    if (tier.prices.length > 0) throw new BadRequestException(`Cannot delete tier with ${tier.prices.length} prices`);
    return this.prisma.priceTier.delete({ where: { id } });
  }

  // PRODUCT PRICES
  async createPrice(dto: CreateProductPriceDto, userId?: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException(`Product "${dto.productId}" not found`);
    const tier = await this.prisma.priceTier.findUnique({ where: { id: dto.tierId } });
    if (!tier) throw new NotFoundException(`Tier "${dto.tierId}" not found`);
    const existing = await this.prisma.productPrice.findUnique({
      where: { productId_tierId: { productId: dto.productId, tierId: dto.tierId } },
    });
    if (existing) throw new ConflictException(`Price already exists for this product and tier`);
    if (dto.sellingPrice < dto.purchasePrice) throw new BadRequestException('Selling price must be >= purchase price');

    return this.prisma.$transaction(async (tx: any) => {
      const price = await tx.productPrice.create({
        data: {
          productId: dto.productId,
          tierId: dto.tierId,
          purchasePrice: dto.purchasePrice,
          sellingPrice: dto.sellingPrice,
          currency: dto.currency || 'KGS',
          isActive: dto.isActive ?? true,
          effectiveFrom: dto.effectiveFrom ? new Date(dto.effectiveFrom) : new Date(),
          effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null,
        },
        include: { product: { include: { translations: true } }, tier: true },
      });
      await tx.priceHistory.create({
        data: {
          productId: dto.productId,
          oldPrice: 0,
          newPrice: dto.sellingPrice,
          currency: dto.currency || 'KGS',
          changedBy: userId,
          reason: 'Initial price',
        },
      });
      return price;
    });
  }

  async findAllPrices(page = 1, limit = 20, productId?: string, tierId?: string, isActive?: boolean) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (productId) where.productId = productId;
    if (tierId) where.tierId = tierId;
    if (isActive !== undefined) where.isActive = isActive;

    const [prices, total] = await Promise.all([
      this.prisma.productPrice.findMany({
        where,
        skip,
        take: limit,
        include: { product: { include: { translations: true } }, tier: true },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.productPrice.count({ where }),
    ]);
    return { data: prices, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async findOnePrice(id: string) {
    const price = await this.prisma.productPrice.findUnique({
      where: { id },
      include: { product: { include: { translations: true } }, tier: true },
    });
    if (!price) throw new NotFoundException(`Price "${id}" not found`);
    return price;
  }

  async updatePrice(id: string, dto: UpdateProductPriceDto, userId?: string) {
    const existing = await this.prisma.productPrice.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Price "${id}" not found`);

    const newPurchase = dto.purchasePrice ?? existing.purchasePrice;
    const newSelling = dto.sellingPrice ?? existing.sellingPrice;
    if (Number(newSelling) < Number(newPurchase)) throw new BadRequestException('Selling >= purchase required');

    return this.prisma.$transaction(async (tx: any) => {
      const updated = await tx.productPrice.update({
        where: { id },
        data: {
          ...(dto.purchasePrice !== undefined && { purchasePrice: dto.purchasePrice }),
          ...(dto.sellingPrice !== undefined && { sellingPrice: dto.sellingPrice }),
          ...(dto.currency && { currency: dto.currency }),
          ...(dto.isActive !== undefined && { isActive: dto.isActive }),
          ...(dto.effectiveFrom && { effectiveFrom: new Date(dto.effectiveFrom) }),
          ...(dto.effectiveUntil !== undefined && { effectiveUntil: dto.effectiveUntil ? new Date(dto.effectiveUntil) : null }),
        },
        include: { product: { include: { translations: true } }, tier: true },
      });

      if (dto.sellingPrice !== undefined && Number(dto.sellingPrice) !== Number(existing.sellingPrice)) {
        await tx.priceHistory.create({
          data: {
            productId: existing.productId,
            oldPrice: existing.sellingPrice,
            newPrice: dto.sellingPrice,
            currency: dto.currency || existing.currency,
            changedBy: userId,
            reason: 'Price update',
          },
        });
      }
      return updated;
    });
  }

  async removePrice(id: string) {
    const price = await this.prisma.productPrice.findUnique({ where: { id } });
    if (!price) throw new NotFoundException(`Price "${id}" not found`);
    return this.prisma.productPrice.delete({ where: { id } });
  }

  // PRICE HISTORY
  async getPriceHistory(productId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const [history, total] = await Promise.all([
      this.prisma.priceHistory.findMany({
        where: { productId },
        skip,
        take: limit,
        include: { product: { include: { translations: true } } },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.priceHistory.count({ where: { productId } }),
    ]);
    return { data: history, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  // BULK UPDATE
  async bulkUpdatePrices(dto: BulkPriceUpdateDto, userId?: string) {
    return this.prisma.$transaction(async (tx: any) => {
      const results = [];
      for (const item of dto.prices) {
        const existing = await tx.productPrice.findUnique({
          where: { productId_tierId: { productId: item.productId, tierId: item.tierId } },
        });
        if (!existing) {
          throw new NotFoundException(`Price not found for product "${item.productId}" and tier "${item.tierId}"`);
        }

        const updated = await tx.productPrice.update({
          where: { productId_tierId: { productId: item.productId, tierId: item.tierId } },
          data: { purchasePrice: item.purchasePrice, sellingPrice: item.sellingPrice },
        });

        if (Number(item.sellingPrice) !== Number(existing.sellingPrice)) {
          await tx.priceHistory.create({
            data: {
              productId: item.productId,
              oldPrice: existing.sellingPrice,
              newPrice: item.sellingPrice,
              currency: existing.currency,
              changedBy: userId,
              reason: dto.reason || 'Bulk update',
            },
          });
        }
        results.push(updated);
      }
      return { updated: results.length, message: 'Bulk price update completed' };
    });
  }
}
