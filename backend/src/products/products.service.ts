import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateProductDto, UpdateProductDto } from './dto';

@Injectable()
export class ProductsService {
  constructor(private readonly prisma: PrismaService) {}

  async findAttributes() {
    return this.prisma.productAttribute.findMany({ orderBy: { sortOrder: 'asc' } });
  }

  async create(createProductDto: CreateProductDto) {
    const {
      sku,
      slug,
      categoryId,
      brandId,
      status,
      isFeatured,
      hasVariants,
      thumbnailUrl,
      weight,
      length,
      width,
      height,
      translations,
      variants,
      images,
      attributes,
    } = createProductDto;

    // Validation: SKU uniqueness
    const existingSku = await this.prisma.product.findUnique({ where: { sku } });
    if (existingSku) {
      throw new ConflictException(`Product with SKU "${sku}" already exists`);
    }

    // Validation: Slug uniqueness
    const existingSlug = await this.prisma.product.findUnique({ where: { slug } });
    if (existingSlug) {
      throw new ConflictException(`Product with slug "${slug}" already exists`);
    }

    // Validation: Category exists
    const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
    if (!category) {
      throw new NotFoundException(`Category with ID "${categoryId}" not found`);
    }

    // Validation: Brand exists if provided
    if (brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) {
        throw new NotFoundException(`Brand with ID "${brandId}" not found`);
      }
    }

    // Validation: ru and ky translations required
    const locales = translations.map((t: any) => t.locale);
    if (!locales.includes('ru') || !locales.includes('ky')) {
      throw new BadRequestException('Both Russian (ru) and Kyrgyz (ky) translations are required');
    }

    // Validation: Attributes exist
    if (attributes && attributes.length > 0) {
      const attributeIds = attributes.map((a: any) => a.attributeId);
      const existingAttributes = await this.prisma.productAttribute.findMany({
        where: { id: { in: attributeIds } },
      });
      if (existingAttributes.length !== attributeIds.length) {
        throw new BadRequestException('One or more attribute IDs are invalid');
      }
    }

    // Transaction: Create product with related data
    return this.prisma.$transaction(async (tx: any) => {
      const product = await tx.product.create({
        data: {
          sku,
          slug,
          categoryId,
          brandId,
          status: status || 'ACTIVE',
          isFeatured: isFeatured ?? false,
          hasVariants: hasVariants || false,
          thumbnailUrl,
          weight,
          length,
          width,
          height,
        },
      });

      // Create translations
      await tx.productTranslation.createMany({
        data: translations.map((t: any) => ({
          productId: product.id,
          locale: t.locale,
          name: t.name,
          description: t.description,
          shortDescription: t.shortDescription,
          metaTitle: t.metaTitle,
          metaDescription: t.metaDescription,
        })),
      });

      // Create variants
      if (variants && variants.length > 0) {
        await tx.productVariant.createMany({
          data: variants.map((v: any, index: number) => ({
            productId: product.id,
            sku: v.sku,
            name: v.name,
            sortOrder: v.sortOrder ?? index,
            imageUrl: v.imageUrl,
            isActive: v.isActive ?? true,
          })),
        });
      }

      // Create images
      if (images && images.length > 0) {
        await tx.productImage.createMany({
          data: images.map((img: any, index: number) => ({
            productId: product.id,
            url: img.url,
            altText: img.altText,
            sortOrder: img.sortOrder ?? index,
          })),
        });
      }

      // Create attributes
      if (attributes && attributes.length > 0) {
        await tx.productAttributeValue.createMany({
          data: attributes.map((attr: any) => ({
            productId: product.id,
            attributeId: attr.attributeId,
            value: attr.value,
          })),
        });
      }

      return tx.product.findUnique({
        where: { id: product.id },
        include: {
          translations: true,
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
          attributes: { include: { attribute: true } },
          category: { include: { translations: true } },
          brand: true,
        },
      });
    });
  }

  async findAll(
    page = 1,
    limit = 20,
    locale?: string,
    categoryId?: string,
    brandId?: string,
    status?: string,
    search?: string,
    includeInactive = false,
  ) {
    const skip = (page - 1) * limit;
    const where: any = includeInactive ? {} : { status: 'ACTIVE' };

    if (categoryId) where.categoryId = categoryId;
    if (brandId) where.brandId = brandId;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { sku: { contains: search, mode: 'insensitive' } },
        { slug: { contains: search, mode: 'insensitive' } },
        { translations: { some: { name: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const [products, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        skip,
        take: limit,
        include: {
          translations: locale ? { where: { locale } } : true,
          variants: true,
          // Public cards need the product's full gallery, not only its thumbnail.
          images: { orderBy: { sortOrder: 'asc' } },
          category: { include: { translations: locale ? { where: { locale } } : true } },
          brand: true,
          attributes: { include: { attribute: true } },
          prices: { where: includeInactive ? {} : { isActive: true } },
          _count: { select: { reviews: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return {
      data: products,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: string, locale?: string) {
    const product = await this.prisma.product.findUnique({
      where: { id, status: 'ACTIVE' },
      include: {
        translations: locale ? { where: { locale } } : true,
        variants: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        prices: { where: { isActive: true } },
        attributes: { include: { attribute: true } },
        category: { include: { translations: locale ? { where: { locale } } : true } },
        brand: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } } },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    return product;
  }

  async findBySlug(slug: string, locale?: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug, status: 'ACTIVE' },
      include: {
        translations: locale ? { where: { locale } } : true,
        variants: { orderBy: { sortOrder: 'asc' } },
        images: { orderBy: { sortOrder: 'asc' } },
        prices: { where: { isActive: true } },
        attributes: { include: { attribute: true } },
        category: { include: { translations: locale ? { where: { locale } } : true } },
        brand: true,
        reviews: {
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } } },
        },
        _count: { select: { reviews: true } },
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with slug "${slug}" not found`);
    }

    return product;
  }

  async update(id: string, updateProductDto: UpdateProductDto) {
    const {
      sku,
      slug,
      categoryId,
      brandId,
      status,
      isFeatured,
      hasVariants,
      thumbnailUrl,
      weight,
      length,
      width,
      height,
      translations,
      variants,
      images,
      attributes,
    } = updateProductDto;

    // Check product exists
    const existingProduct = await this.prisma.product.findUnique({ where: { id } });
    if (!existingProduct) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    // Validate SKU uniqueness if changed
    if (sku && sku !== existingProduct.sku) {
      const skuConflict = await this.prisma.product.findUnique({ where: { sku } });
      if (skuConflict) {
        throw new ConflictException(`Product with SKU "${sku}" already exists`);
      }
    }

    // Validate slug uniqueness if changed
    if (slug && slug !== existingProduct.slug) {
      const slugConflict = await this.prisma.product.findUnique({ where: { slug } });
      if (slugConflict) {
        throw new ConflictException(`Product with slug "${slug}" already exists`);
      }
    }

    // Validate category if changed
    if (categoryId) {
      const category = await this.prisma.category.findUnique({ where: { id: categoryId } });
      if (!category) {
        throw new NotFoundException(`Category with ID "${categoryId}" not found`);
      }
    }

    // Validate brand if changed
    if (brandId) {
      const brand = await this.prisma.brand.findUnique({ where: { id: brandId } });
      if (!brand) {
        throw new NotFoundException(`Brand with ID "${brandId}" not found`);
      }
    }

    // Transaction: Update product with related data
    return this.prisma.$transaction(async (tx: any) => {
      await tx.product.update({
        where: { id },
        data: {
          ...(sku && { sku }),
          ...(slug && { slug }),
          ...(categoryId && { categoryId }),
          ...(brandId !== undefined && { brandId }),
          ...(status && { status }),
          ...(isFeatured !== undefined && { isFeatured }),
          ...(hasVariants !== undefined && { hasVariants }),
          ...(thumbnailUrl !== undefined && { thumbnailUrl }),
          ...(weight !== undefined && { weight }),
          ...(length !== undefined && { length }),
          ...(width !== undefined && { width }),
          ...(height !== undefined && { height }),
        },
      });

      // Update translations
      if (translations && translations.length > 0) {
        await tx.productTranslation.deleteMany({ where: { productId: id } });
        await tx.productTranslation.createMany({
          data: translations.map((t: any) => ({
            productId: id,
            locale: t.locale,
            name: t.name,
            description: t.description,
            shortDescription: t.shortDescription,
            metaTitle: t.metaTitle,
            metaDescription: t.metaDescription,
          })),
        });
      }

      // Update variants
      if (variants) {
        await tx.productVariant.deleteMany({ where: { productId: id } });
        if (variants.length > 0) {
          await tx.productVariant.createMany({
            data: variants.map((v: any, index: number) => ({
              productId: id,
              sku: v.sku,
              name: v.name,
              sortOrder: v.sortOrder ?? index,
              imageUrl: v.imageUrl,
              isActive: v.isActive ?? true,
            })),
          });
        }
      }

      // Update images
      if (images) {
        await tx.productImage.deleteMany({ where: { productId: id } });
        if (images.length > 0) {
          await tx.productImage.createMany({
            data: images.map((img: any, index: number) => ({
              productId: id,
              url: img.url,
              altText: img.altText,
              sortOrder: img.sortOrder ?? index,
            })),
          });
        }
      }

      // Update attributes
      if (attributes) {
        await tx.productAttributeValue.deleteMany({ where: { productId: id } });
        if (attributes.length > 0) {
          await tx.productAttributeValue.createMany({
            data: attributes.map((attr: any) => ({
              productId: id,
              attributeId: attr.attributeId,
              value: attr.value,
            })),
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          translations: true,
          variants: true,
          images: { orderBy: { sortOrder: 'asc' } },
          attributes: { include: { attribute: true } },
          category: { include: { translations: true } },
          brand: true,
        },
      });
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({
      where: { id },
      include: { orderItems: true, cartItems: true },
    });

    if (!product) {
      throw new NotFoundException(`Product with ID "${id}" not found`);
    }

    if (product.orderItems.length > 0) {
      throw new BadRequestException(
        `Cannot delete product because it has ${product.orderItems.length} order items`,
      );
    }

    if (product.cartItems.length > 0) {
      throw new BadRequestException(
        `Cannot delete product because it is in ${product.cartItems.length} carts`,
      );
    }

    return this.prisma.product.delete({ where: { id } });
  }

  async getBySku(sku: string) {
    const product = await this.prisma.product.findUnique({
      where: { sku },
      include: {
        translations: true,
        variants: true,
        images: { orderBy: { sortOrder: 'asc' } },
        attributes: { include: { attribute: true } },
        category: { include: { translations: true } },
        brand: true,
      },
    });

    if (!product) {
      throw new NotFoundException(`Product with SKU "${sku}" not found`);
    }

    return product;
  }
}
