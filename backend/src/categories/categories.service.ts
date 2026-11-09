import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';

@Injectable()
export class CategoriesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new category with translations
   */
  async create(createCategoryDto: CreateCategoryDto) {
    const { slug, parentId, imageUrl, isActive, sortOrder, translations } =
      createCategoryDto;

    // Check if slug already exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { slug },
    });

    if (existingCategory) {
      throw new ConflictException(`Category with slug "${slug}" already exists`);
    }

    // If parentId is provided, check if parent exists
    if (parentId) {
      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID "${parentId}" not found`);
      }
    }

    // Validate translations (must have ru and ky)
    const locales = translations.map((t: any) => t.locale);
    if (!locales.includes('ru') || !locales.includes('ky')) {
      throw new BadRequestException('Both Russian (ru) and Kyrgyz (ky) translations are required');
    }

    // Create category with translations in a transaction
    return this.prisma.$transaction(async (tx: any) => {
      const category = await tx.category.create({
        data: {
          slug,
          parentId,
          imageUrl,
          isActive: isActive ?? true,
          sortOrder: sortOrder ?? 0,
        },
      });

      // Create translations
      await tx.categoryTranslation.createMany({
        data: translations.map((translation: any) => ({
          categoryId: category.id,
          locale: translation.locale,
          name: translation.name,
          description: translation.description,
        })),
      });

      // Return category with translations
      return tx.category.findUnique({
        where: { id: category.id },
        include: {
          translations: true,
          parent: {
            include: {
              translations: true,
            },
          },
        },
      });
    });
  }

  /**
   * Get all categories with optional filtering
   */
  async findAll(
    page = 1,
    limit = 50,
    locale?: string,
    parentId?: string,
    isActive?: boolean,
  ) {
    const skip = (page - 1) * limit;

    const where: any = {};
    if (parentId !== undefined) {
      where.parentId = parentId === 'null' ? null : parentId;
    }
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    if (isActive === true) {
      where.products = { some: { status: 'ACTIVE' } };
    }

    const [categories, total] = await Promise.all([
      this.prisma.category.findMany({
        where,
        skip,
        take: limit,
        include: {
          translations: locale
            ? {
                where: { locale },
              }
            : true,
          parent: {
            select: {
              id: true,
              slug: true,
              translations: locale
                ? {
                    where: { locale },
                  }
                : true,
            },
          },
          _count: {
            select: {
              children: true,
              products: isActive === true ? { where: { status: 'ACTIVE' } } : true,
            },
          },
        },
        orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }],
      }),
      this.prisma.category.count({ where }),
    ]);

    return {
      data: categories,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get category tree (hierarchical structure)
   */
  async getTree(locale?: string, isActive?: boolean) {
    const where: any = { parentId: null };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }

    const rootCategories = await this.prisma.category.findMany({
      where,
      include: {
        translations: locale
          ? {
              where: { locale },
            }
          : true,
        children: {
          where: isActive !== undefined ? { isActive } : {},
          include: {
            translations: locale
              ? {
                  where: { locale },
                }
              : true,
            children: {
              where: isActive !== undefined ? { isActive } : {},
              include: {
                translations: locale
                  ? {
                      where: { locale },
                    }
                  : true,
                _count: {
                  select: {
                    products: true,
                  },
                },
              },
              orderBy: [{ sortOrder: 'asc' }],
            },
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: [{ sortOrder: 'asc' }],
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
      orderBy: [{ sortOrder: 'asc' }],
    });

    return rootCategories;
  }

  /**
   * Get a single category by ID
   */
  async findOne(id: string, locale?: string) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        translations: locale
          ? {
              where: { locale },
            }
          : true,
        parent: {
          include: {
            translations: locale
              ? {
                  where: { locale },
                }
              : true,
          },
        },
        children: {
          include: {
            translations: locale
              ? {
                  where: { locale },
                }
              : true,
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: [{ sortOrder: 'asc' }],
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    return category;
  }

  /**
   * Get a category by slug
   */
  async findBySlug(slug: string, locale?: string) {
    const category = await this.prisma.category.findUnique({
      where: { slug },
      include: {
        translations: locale
          ? {
              where: { locale },
            }
          : true,
        parent: {
          include: {
            translations: locale
              ? {
                  where: { locale },
                }
              : true,
          },
        },
        children: {
          include: {
            translations: locale
              ? {
                  where: { locale },
                }
              : true,
            _count: {
              select: {
                products: true,
              },
            },
          },
          orderBy: [{ sortOrder: 'asc' }],
        },
        _count: {
          select: {
            products: true,
          },
        },
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with slug "${slug}" not found`);
    }

    return category;
  }

  /**
   * Update a category
   */
  async update(id: string, updateCategoryDto: UpdateCategoryDto) {
    const { slug, parentId, imageUrl, isActive, sortOrder, translations } =
      updateCategoryDto;

    // Check if category exists
    const existingCategory = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!existingCategory) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // If slug is being updated, check for conflicts
    if (slug && slug !== existingCategory.slug) {
      const categoryWithSameSlug = await this.prisma.category.findUnique({
        where: { slug },
      });

      if (categoryWithSameSlug) {
        throw new ConflictException(`Category with slug "${slug}" already exists`);
      }
    }

    // If parentId is being updated, validate it
    if (parentId !== undefined && parentId !== null) {
      if (parentId === id) {
        throw new BadRequestException('Category cannot be its own parent');
      }

      const parentCategory = await this.prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory) {
        throw new NotFoundException(`Parent category with ID "${parentId}" not found`);
      }

      // Check for circular reference
      const isCircular = await this.checkCircularReference(id, parentId);
      if (isCircular) {
        throw new BadRequestException('Circular reference detected in category hierarchy');
      }
    }

    // Update category with translations in a transaction
    return this.prisma.$transaction(async (tx: any) => {
      // Update category
      await tx.category.update({
        where: { id },
        data: {
          ...(slug && { slug }),
          ...(parentId !== undefined && { parentId }),
          ...(imageUrl !== undefined && { imageUrl }),
          ...(isActive !== undefined && { isActive }),
          ...(sortOrder !== undefined && { sortOrder }),
        },
      });

      // Update translations if provided
      if (translations && translations.length > 0) {
        // Delete existing translations
        await tx.categoryTranslation.deleteMany({
          where: { categoryId: id },
        });

        // Create new translations
        await tx.categoryTranslation.createMany({
          data: translations.map((translation: any) => ({
            categoryId: id,
            locale: translation.locale,
            name: translation.name,
            description: translation.description,
          })),
        });
      }

      // Return updated category with translations
      return tx.category.findUnique({
        where: { id },
        include: {
          translations: true,
          parent: {
            include: {
              translations: true,
            },
          },
          children: {
            include: {
              translations: true,
            },
          },
        },
      });
    });
  }

  /**
   * Delete a category
   */
  async remove(id: string) {
    // Check if category exists
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        children: true,
        products: true,
      },
    });

    if (!category) {
      throw new NotFoundException(`Category with ID "${id}" not found`);
    }

    // Check if category has children
    if (category.children.length > 0) {
      throw new BadRequestException(
        `Cannot delete category because it has ${category.children.length} subcategories`,
      );
    }

    // Check if category has products
    if (category.products.length > 0) {
      throw new BadRequestException(
        `Cannot delete category because it has ${category.products.length} products`,
      );
    }

    // Delete category (translations will be deleted via CASCADE)
    return this.prisma.category.delete({
      where: { id },
    });
  }

  /**
   * Reorder categories
   */
  async reorder(categoryIds: string[]) {
    return this.prisma.$transaction(async (tx: any) => {
      const updates = categoryIds.map((categoryId, index) =>
        tx.category.update({
          where: { id: categoryId },
          data: { sortOrder: index },
        }),
      );

      await Promise.all(updates);

      return { message: 'Categories reordered successfully' };
    });
  }

  /**
   * Check for circular reference in category hierarchy
   */
  private async checkCircularReference(
    categoryId: string,
    newParentId: string,
  ): Promise<boolean> {
    let currentParentId: string | null = newParentId;

    while (currentParentId) {
      if (currentParentId === categoryId) {
        return true;
      }

      const parent: any = await this.prisma.category.findUnique({
        where: { id: currentParentId },
        select: { parentId: true },
      });

      currentParentId = parent?.parentId || null;
    }

    return false;
  }
}
