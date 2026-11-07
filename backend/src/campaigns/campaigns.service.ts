import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';

@Injectable()
export class CampaignsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateCampaignDto) {
    // Check if slug already exists
    const existing = await this.prisma.campaign.findUnique({
      where: { slug: dto.slug },
    });

    if (existing) {
      throw new BadRequestException('Campaign with this slug already exists');
    }

    // Validate dates
    const startDate = new Date(dto.startDate);
    const endDate = new Date(dto.endDate);

    if (endDate <= startDate) {
      throw new BadRequestException('End date must be after start date');
    }

    // Verify all products exist
    const productIds = dto.products.map((p) => p.productId);
    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    if (products.length !== productIds.length) {
      throw new BadRequestException('One or more products not found');
    }

    // Create campaign with translations and products
    return this.prisma.campaign.create({
      data: {
        slug: dto.slug,
        type: dto.type,
        bannerUrl: dto.bannerUrl,
        badgeText: dto.badgeText,
        backgroundColor: dto.backgroundColor,
        isActive: dto.isActive ?? true,
        startDate,
        endDate,
        sortOrder: dto.sortOrder || 0,
        translations: {
          create: dto.translations.map((t) => ({
            locale: t.locale,
            name: t.name,
            description: t.description,
          })),
        },
        products: {
          create: dto.products.map((p, index) => ({
            productId: p.productId,
            sortOrder: p.sortOrder ?? index,
          })),
        },
      },
      include: {
        translations: true,
        products: {
          orderBy: { sortOrder: 'asc' },
          include: {
            product: {
              include: {
                translations: true,
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

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where,
        skip,
        take: limit,
        orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
        include: {
          translations: locale ? { where: { locale } } : true,
          products: {
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
      this.prisma.campaign.count({ where }),
    ]);

    return {
      data: campaigns,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findActive(locale?: string) {
    const now = new Date();

    const campaigns = await this.prisma.campaign.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
      },
      orderBy: [{ sortOrder: 'asc' }, { startDate: 'desc' }],
      include: {
        translations: locale ? { where: { locale } } : true,
        products: {
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
    });

    return campaigns;
  }

  async findOne(id: string, locale?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
      include: {
        translations: locale ? { where: { locale } } : true,
        products: {
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

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async findBySlug(slug: string, locale?: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { slug },
      include: {
        translations: locale ? { where: { locale } } : true,
        products: {
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

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign;
  }

  async update(id: string, dto: UpdateCampaignDto) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    // If slug is changing, check uniqueness
    if (dto.slug && dto.slug !== campaign.slug) {
      const existing = await this.prisma.campaign.findUnique({
        where: { slug: dto.slug },
      });

      if (existing) {
        throw new BadRequestException('Campaign with this slug already exists');
      }
    }

    // Validate dates if provided
    if (dto.startDate || dto.endDate) {
      const startDate = dto.startDate
        ? new Date(dto.startDate)
        : campaign.startDate;
      const endDate = dto.endDate ? new Date(dto.endDate) : campaign.endDate;

      if (endDate <= startDate) {
        throw new BadRequestException('End date must be after start date');
      }
    }

    // Update campaign
    const updateData: any = {
      slug: dto.slug,
      type: dto.type,
      bannerUrl: dto.bannerUrl,
      badgeText: dto.badgeText,
      backgroundColor: dto.backgroundColor,
      isActive: dto.isActive,
      startDate: dto.startDate ? new Date(dto.startDate) : undefined,
      endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      sortOrder: dto.sortOrder,
    };

    // Update translations if provided
    if (dto.translations) {
      await this.prisma.campaignTranslation.deleteMany({
        where: { campaignId: id },
      });
      updateData.translations = {
        create: dto.translations.map((t) => ({
          locale: t.locale,
          name: t.name,
          description: t.description,
        })),
      };
    }

    // Update products if provided
    if (dto.products) {
      // Verify products exist
      const productIds = dto.products.map((p) => p.productId);
      const products = await this.prisma.product.findMany({
        where: { id: { in: productIds } },
      });

      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products not found');
      }

      await this.prisma.campaignProduct.deleteMany({
        where: { campaignId: id },
      });

      updateData.products = {
        create: dto.products.map((p, index) => ({
          productId: p.productId,
          sortOrder: p.sortOrder ?? index,
        })),
      };
    }

    return this.prisma.campaign.update({
      where: { id },
      data: updateData,
      include: {
        translations: true,
        products: {
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

  async remove(id: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    await this.prisma.campaign.delete({
      where: { id },
    });
  }

  /**
   * Check if a product is in any active campaign
   */
  async isProductInActiveCampaign(productId: string): Promise<boolean> {
    const now = new Date();

    const count = await this.prisma.campaignProduct.count({
      where: {
        productId,
        campaign: {
          isActive: true,
          startDate: { lte: now },
          endDate: { gte: now },
        },
      },
    });

    return count > 0;
  }

  /**
   * Get active campaigns for a specific product
   */
  async getProductCampaigns(productId: string, locale?: string) {
    const now = new Date();

    return this.prisma.campaign.findMany({
      where: {
        isActive: true,
        startDate: { lte: now },
        endDate: { gte: now },
        products: {
          some: { productId },
        },
      },
      include: {
        translations: locale ? { where: { locale } } : true,
      },
    });
  }
}
