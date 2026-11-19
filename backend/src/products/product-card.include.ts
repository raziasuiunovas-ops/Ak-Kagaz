import type { Prisma } from '@prisma/client';

/**
 * Keep public product-list responses small enough for mobile connections.
 * Product details still use the full product relation set.
 */
export function productCardInclude(locale?: string) {
  const now = new Date();

  return {
    translations: {
      ...(locale ? { where: { locale } } : {}),
      select: {
        id: true,
        productId: true,
        locale: true,
        name: true,
        shortDescription: true,
      },
    },
    images: {
      select: {
        id: true,
        productId: true,
        url: true,
        altText: true,
        sortOrder: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: 3,
    },
    variants: {
      where: { isActive: true, imageUrl: { not: null } },
      select: {
        id: true,
        productId: true,
        name: true,
        sortOrder: true,
        imageUrl: true,
        isActive: true,
      },
      orderBy: { sortOrder: 'asc' },
      take: 4,
    },
    attributes: {
      take: 2,
      select: {
        id: true,
        productId: true,
        attributeId: true,
        value: true,
        attribute: {
          select: {
            id: true,
            name: true,
            displayNameRu: true,
            displayNameKy: true,
            type: true,
          },
        },
      },
    },
    prices: {
      where: {
        OR: [
          {
            isActive: true,
            isEstimate: false,
            effectiveFrom: { lte: now },
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }],
          },
          {
            isEstimate: true,
            OR: [{ effectiveUntil: null }, { effectiveUntil: { gte: now } }],
          },
        ],
      },
      select: {
        id: true,
        productId: true,
        tierId: true,
        sellingPrice: true,
        currency: true,
        isActive: true,
        isEstimate: true,
        effectiveFrom: true,
        effectiveUntil: true,
      },
    },
  } satisfies Prisma.ProductInclude;
}
