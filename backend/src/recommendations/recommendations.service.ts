import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { TrackViewDto } from './dto';

@Injectable()
export class RecommendationsService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Track product view
   */
  async trackView(dto: TrackViewDto) {
    if (!dto.userId && !dto.sessionId) {
      return { success: false, message: 'User ID or Session ID required' };
    }

    // Check if product exists
    const product = await this.prisma.product.findUnique({
      where: { id: dto.productId },
    });

    if (!product) {
      return { success: false, message: 'Product not found' };
    }

    // Upsert product view
    if (dto.userId) {
      await this.prisma.productView.upsert({
        where: {
          userId_productId: {
            userId: dto.userId,
            productId: dto.productId,
          },
        },
        update: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
        create: {
          userId: dto.userId,
          productId: dto.productId,
          viewCount: 1,
        },
      });
    } else if (dto.sessionId) {
      await this.prisma.productView.upsert({
        where: {
          sessionId_productId: {
            sessionId: dto.sessionId,
            productId: dto.productId,
          },
        },
        update: {
          viewCount: { increment: 1 },
          lastViewedAt: new Date(),
        },
        create: {
          sessionId: dto.sessionId,
          productId: dto.productId,
          viewCount: 1,
        },
      });
    }

    return { success: true };
  }

  /**
   * Get personalized recommendations for authenticated user
   */
  async getPersonalRecommendations(userId: string, limit = 12) {
    // Get user's order history
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        status: { in: ['DELIVERED'] },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                category: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    // Extract purchased product IDs and categories
    const purchasedProductIds = new Set<string>();
    const categoryIds = new Set<string>();

    for (const order of orders) {
      for (const item of order.items) {
        purchasedProductIds.add(item.productId);
        categoryIds.add(item.product.categoryId);
      }
    }

    // Get viewed but not purchased products
    const viewedProducts = await this.prisma.productView.findMany({
      where: {
        userId,
        productId: { notIn: Array.from(purchasedProductIds) },
      },
      orderBy: [{ lastViewedAt: 'desc' }, { viewCount: 'desc' }],
      take: 20,
    });

    const viewedProductIds = viewedProducts.map((v) => v.productId);

    // Get recommendations based on:
    // 1. Products from favorite categories (not purchased)
    // 2. Frequently bought together with purchased products
    // 3. Popular products (fallback)

    const recommendations = await this.prisma.product.findMany({
      where: {
        id: { notIn: Array.from(purchasedProductIds) },
        status: 'ACTIVE',
        OR: [
          // From favorite categories
          {
            categoryId: { in: Array.from(categoryIds) },
          },
          // Viewed products
          {
            id: { in: viewedProductIds },
          },
        ],
      },
      include: {
        translations: true,
        images: { orderBy: { sortOrder: 'asc' } },
        prices: {
          where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
          include: { tier: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
      take: limit,
    });

    return recommendations;
  }

  /**
   * Get recommendations for guest users
   */
  async getGuestRecommendations(sessionId?: string, limit = 12) {
    let recommendations: any[] = [];

    // If session provided, get based on viewed products
    if (sessionId) {
      const viewedProducts = await this.prisma.productView.findMany({
        where: { sessionId },
        orderBy: [{ lastViewedAt: 'desc' }, { viewCount: 'desc' }],
        take: 5,
      });

      if (viewedProducts.length > 0) {
        const productIds = viewedProducts.map((v) => v.productId);

        // Get categories from viewed products
        const products = await this.prisma.product.findMany({
          where: { id: { in: productIds } },
          select: { categoryId: true },
        });

        const categoryIds = [...new Set(products.map((p) => p.categoryId))];

        // Recommend from same categories
        recommendations = await this.prisma.product.findMany({
          where: {
            categoryId: { in: categoryIds },
            id: { notIn: productIds },
            status: 'ACTIVE',
          },
          include: {
            translations: true,
            images: { orderBy: { sortOrder: 'asc' } },
            prices: {
              where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
              include: { tier: true },
            },
            reviews: {
              where: { status: 'APPROVED' },
              select: { rating: true },
            },
          },
          take: limit,
        });
      }
    }

    // If not enough recommendations, add popular products
    if (recommendations.length < limit) {
      const popular = await this.getPopularProducts(limit - recommendations.length);
      recommendations = [...recommendations, ...popular];
    }

    return recommendations;
  }

  /**
   * Get frequently bought together products
   */
  async getFrequentlyBought(productId: string, limit = 4) {
    // First check manual recommendations
    const manual = await this.prisma.frequentlyBoughtTogether.findMany({
      where: { productId, isManual: true },
      orderBy: { frequency: 'desc' },
      take: limit,
      include: {
        relatedProduct: {
          include: {
            translations: true,
            images: { orderBy: { sortOrder: 'asc' } },
            prices: {
              where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
              include: { tier: true },
            },
          },
        },
      },
    });

    if (manual.length >= limit) {
      return manual.map((m) => m.relatedProduct);
    }

    // Get automatic recommendations
    const automatic = await this.prisma.frequentlyBoughtTogether.findMany({
      where: { productId, isManual: false },
      orderBy: { frequency: 'desc' },
      take: limit - manual.length,
      include: {
        relatedProduct: {
          include: {
            translations: true,
            images: { orderBy: { sortOrder: 'asc' } },
            prices: {
              where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
              include: { tier: true },
            },
          },
        },
      },
    });

    const allRecommendations = [
      ...manual.map((m) => m.relatedProduct),
      ...automatic.map((a) => a.relatedProduct),
    ];

    return allRecommendations;
  }

  /**
   * Get similar products (same category)
   */
  async getSimilarProducts(productId: string, limit = 8) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
      select: { categoryId: true },
    });

    if (!product) {
      return [];
    }

    return this.prisma.product.findMany({
      where: {
        categoryId: product.categoryId,
        id: { not: productId },
        status: 'ACTIVE',
      },
      include: {
        translations: true,
        images: { orderBy: { sortOrder: 'asc' } },
        prices: {
          where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
          include: { tier: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
      take: limit,
    });
  }

  /**
   * Get recently viewed products
   */
  async getRecentlyViewed(userId: string, limit = 10) {
    const views = await this.prisma.productView.findMany({
      where: { userId },
      orderBy: { lastViewedAt: 'desc' },
      take: limit,
      include: {
        product: {
          include: {
            translations: true,
            images: { orderBy: { sortOrder: 'asc' } },
            prices: {
              where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
              include: { tier: true },
            },
          },
        },
      },
    });

    return views.map((v) => v.product);
  }

  /**
   * Get products for repeat purchase
   */
  async getRepeatPurchases(userId: string, limit = 12) {
    // Get user's delivered orders
    const orders = await this.prisma.order.findMany({
      where: {
        userId,
        status: { in: ['DELIVERED'] },
      },
      include: {
        items: {
          include: {
            product: {
              include: {
                translations: true,
                images: { orderBy: { sortOrder: 'asc' } },
                prices: {
                  where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
                  include: { tier: true },
                },
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Count product purchase frequency
    const productFrequency = new Map<string, { product: any; count: number; lastPurchased: Date }>();

    for (const order of orders) {
      for (const item of order.items) {
        const existing = productFrequency.get(item.productId);
        if (existing) {
          existing.count += 1;
          if (order.createdAt > existing.lastPurchased) {
            existing.lastPurchased = order.createdAt;
          }
        } else {
          productFrequency.set(item.productId, {
            product: item.product,
            count: 1,
            lastPurchased: order.createdAt,
          });
        }
      }
    }

    // Sort by frequency and recency
    const sorted = Array.from(productFrequency.values())
      .sort((a, b) => {
        // First by frequency (descending)
        if (b.count !== a.count) {
          return b.count - a.count;
        }
        // Then by recency (descending)
        return b.lastPurchased.getTime() - a.lastPurchased.getTime();
      })
      .slice(0, limit);

    return sorted.map((item) => ({
      ...item.product,
      purchaseCount: item.count,
      lastPurchased: item.lastPurchased,
    }));
  }

  /**
   * Get popular products
   */
  async getPopularProducts(limit = 12) {
    // Get products with most orders in the last 30 days
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const popularProductIds = await this.prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: {
          createdAt: { gte: thirtyDaysAgo },
          status: { in: ['DELIVERED', 'SHIPPED', 'READY'] },
        },
      },
      _count: { productId: true },
      orderBy: { _count: { productId: 'desc' } },
      take: limit,
    });

    const productIds = popularProductIds.map((p) => p.productId);

    if (productIds.length === 0) {
      // With no order history, show the admin-curated featured selection.
      return this.prisma.product.findMany({
        where: { status: 'ACTIVE', isFeatured: true },
        include: {
          translations: true,
          images: { orderBy: { sortOrder: 'asc' } },
          variants: { orderBy: { sortOrder: 'asc' } },
          attributes: { include: { attribute: true } },
          prices: {
            where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
            include: { tier: true },
          },
        },
        orderBy: { updatedAt: 'desc' },
        take: limit,
      });
    }

    return this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: {
        translations: true,
        images: { orderBy: { sortOrder: 'asc' } },
        variants: { orderBy: { sortOrder: 'asc' } },
        attributes: { include: { attribute: true } },
        prices: {
          where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
          include: { tier: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    });
  }

  /**
   * Get trending products (based on views)
   */
  async getTrendingProducts(limit = 12) {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const trendingViews = await this.prisma.productView.groupBy({
      by: ['productId'],
      where: {
        lastViewedAt: { gte: sevenDaysAgo },
      },
      _sum: { viewCount: true },
      orderBy: { _sum: { viewCount: 'desc' } },
      take: limit,
    });

    const productIds = trendingViews.map((v) => v.productId);

    if (productIds.length === 0) {
      return this.getPopularProducts(limit);
    }

    return this.prisma.product.findMany({
      where: { id: { in: productIds }, status: 'ACTIVE' },
      include: {
        translations: true,
        images: { orderBy: { sortOrder: 'asc' } },
        prices: {
          where: { OR: [{ isActive: true, isEstimate: false }, { isEstimate: true }] },
          include: { tier: true },
        },
        reviews: {
          where: { status: 'APPROVED' },
          select: { rating: true },
        },
      },
    });
  }

  /**
   * Analyze and update "frequently bought together" from orders
   * This should run periodically (e.g., daily cron job)
   */
  async analyzeFrequentlyBoughtTogether() {
    // Get all completed orders
    const orders = await this.prisma.order.findMany({
      where: {
        status: { in: ['DELIVERED'] },
      },
      include: {
        items: {
          select: { productId: true },
        },
      },
    });

    // Count product pair occurrences
    const pairCounts = new Map<string, number>();

    for (const order of orders) {
      const productIds = order.items.map((item) => item.productId);

      // Create pairs
      for (let i = 0; i < productIds.length; i++) {
        for (let j = i + 1; j < productIds.length; j++) {
          const pairKey = [productIds[i], productIds[j]].sort().join('_');
          pairCounts.set(pairKey, (pairCounts.get(pairKey) || 0) + 1);
        }
      }
    }

    // Update database (only pairs with frequency >= 2)
    for (const [pairKey, count] of pairCounts.entries()) {
      if (count < 2) continue;

      const [productId1, productId2] = pairKey.split('_');

      // Create both directions
      await this.prisma.frequentlyBoughtTogether.upsert({
        where: {
          productId_relatedProductId: {
            productId: productId1,
            relatedProductId: productId2,
          },
        },
        update: { frequency: count },
        create: {
          productId: productId1,
          relatedProductId: productId2,
          frequency: count,
          isManual: false,
        },
      });

      await this.prisma.frequentlyBoughtTogether.upsert({
        where: {
          productId_relatedProductId: {
            productId: productId2,
            relatedProductId: productId1,
          },
        },
        update: { frequency: count },
        create: {
          productId: productId2,
          relatedProductId: productId1,
          frequency: count,
          isManual: false,
        },
      });
    }

    return { success: true, pairsAnalyzed: pairCounts.size };
  }
}
