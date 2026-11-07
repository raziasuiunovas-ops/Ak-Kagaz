import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateBundleDto, UpdateBundleDto } from './dto';

@Injectable()
export class BundlesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateBundleDto) {
    // Check if slug already exists
    const existing = await this.prisma.productBundle.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Bundle with this slug already exists');
    }

    // Verify all products exist
    const productIds = dto.items.map((item) => item.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Create bundle with translations and items
    return this.prisma.productBundle.create({
      data: {
        slug: dto.slug,
        type: dto.type,
        imageUrl: dto.imageUrl,
        discountPercent: dto.discountPercent || 0,
        isActive: dto.isActive ?? true,
        sortOrder: dto.sortOrder || 0,
        translations: {
          create: dto.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        },
        items: {
          create: dto.items.map((item, index) => ({
            productId: item.productId,
            quantity: item.quantity,
            sortOrder: item.sortOrder ?? index,
            isRemovable: item.isRemovable ?? true,
          })),
        },
      },
      include: {
        translations: true,
        items: {
          include: {
            product: {
              include: {
                translations: true,
                images: true,
                prices: {
                  where: { isActive: true },
                  include: { tier: true },
                },
              },
            },
          },
        },
      },
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    locale?: string,
    type?: string,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};

    if (type) {
      where.type = type;
    }

    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const [bundles, total] = await Promise.all([
      this.prisma.productBundle.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
        include: {
          translations: locale ? { where: { locale } } : true,
          items: {
            orderBy: { sortOrder: 'asc' },
            include: {
              product: {
                include: {
                  translations: locale ? { where: { locale } } : true,
                  images: { orderBy: { sortOrder: 'asc' }, take: 1 },
                  prices: {
                    where: { isActive: true },
                    include: { tier: true },
                  },
                },
              },
            },
          },
        },
      }),
      this.prisma.productBundle.count({ where }),
    ]);

    return {
      data: bundles.map((bundle) => this.calculateBundlePrice(bundle)),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string, locale?: string) {
    const bundle = await this.prisma.productBundle.findUnique({
      where: { id },
      include: {
        translations: locale ? { where: { locale } } : true,
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              include: {
                translations: locale ? { where: { locale } } : true,
                images: { orderBy: { sortOrder: 'asc' } },
                prices: {
                  where: { isActive: true },
                  include: { tier: true },
                },
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    return this.calculateBundlePrice(bundle);
  }

  async findBySlug(slug: string, locale?: string) {
    const bundle = await this.prisma.productBundle.findUnique({
      where: { slug },
      include: {
        translations: locale ? { where: { locale } } : true,
        items: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              include: {
                translations: locale ? { where: { locale } } : true,
                images: { orderBy: { sortOrder: 'asc' } },
                prices: {
                  where: { isActive: true },
                  include: { tier: true },
                },
              },
            },
          },
        },
      },
    });

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    return this.calculateBundlePrice(bundle);
  }

  async update(id: string, dto: UpdateBundleDto) {
    const bundle = await this.prisma.productBundle.findUnique({
      where: { id },
    });

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    // If slug is changing, check uniqueness
    if (dto.slug && dto.slug !== bundle.slug) {
      const existing = await this.prisma.productBundle.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new BadRequestException('Bundle with this slug already exists');
      }
    }

    // Update bundle
    const updateData: any = {
      slug: dto.slug,
      type: dto.type,
      imageUrl: dto.imageUrl,
      discountPercent: dto.discountPercent,
      isActive: dto.isActive,
      sortOrder: dto.sortOrder,
    };

    // Update translations if provided
    if (dto.translations) {
      await this.prisma.productBundleTranslation.deleteMany({
        where: { bundleId: id },
      });
      updateData.translations = {
        create: dto.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description,
        })),
      };
    }

    // Update items if provided
    if (dto.items) {
      // Verify products exist
      const productIds = dto.items.map((item) => item.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products not found');
      }

      await this.prisma.productBundleItem.deleteMany({
        where: { bundleId: id },
      });

      updateData.items = {
        create: dto.items.map((item, index) => ({
          productId: item.productId,
          quantity: item.quantity,
          sortOrder: item.sortOrder ?? index,
          isRemovable: item.isRemovable ?? true,
        })),
      };
    }

    const updated = await this.prisma.productBundle.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
        items: {
          include: {
            product: {
              include: {
                translations: true,
                images: true,
                prices: {
                  where: { isActive: true },
                  include: { tier: true },
                },
              },
            },
          },
        },
      },
    });

    return this.calculateBundlePrice(updated);
  }

  async remove(id: string) {
    const bundle = await this.prisma.productBundle.findUnique({
      where: { id },
    });

    if (!bundle) {
      throw new NotFoundException('Bundle not found');
    }

    await this.prisma.productBundle.delete({
      where: { id },
    });
  }

  /**
   * Calculate bundle price with discount
   */
  private calculateBundlePrice(bundle: any) {
    let totalPrice = 0;

    // Calculate total price from all items
    for (const item of bundle.items) {
      const product = item.product;
      // Get default tier price (tier with minQuantity = 1)
      const price = product.prices.find(
        (p: any) => p.tier.minQuantity === 1,
      )?.sellingPrice;

      if (price) {
        totalPrice += Number(price) * item.quantity;
      }
    }

    // Apply bundle discount
    const discountAmount = (totalPrice * bundle.discountPercent) / 100;
    const finalPrice = totalPrice - discountAmount;

    return {
      ...bundle,
      pricing: {
        totalPrice: totalPrice.toFixed(2),
        discountPercent: bundle.discountPercent,
        discountAmount: discountAmount.toFixed(2),
        finalPrice: finalPrice.toFixed(2),
        currency: 'KGS',
      },
    };
  }
}
