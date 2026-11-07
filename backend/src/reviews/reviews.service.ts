import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateReviewDto } from './dto';

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateReviewDto, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    
    const existingReview = await this.prisma.review.findFirst({ where: { productId: dto.productId, userId } });
    if (existingReview) throw new BadRequestException('You already reviewed this product');

    return this.prisma.review.create({
      data: { productId: dto.productId, userId, rating: dto.rating, comment: dto.comment, status: 'PENDING' },
      include: { user: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true } } } }, product: { include: { translations: true } } },
    });
  }

  async findAll(page = 1, limit = 20, productId?: string, status?: string) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (productId) where.productId = productId;
    if (status) where.status = status;

    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({ where, skip, take: limit, include: { user: { select: { id: true, profile: { select: { firstName: true } } } }, product: { include: { translations: true } } }, orderBy: { createdAt: 'desc' } }),
      this.prisma.review.count({ where }),
    ]);
    return { data: reviews, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } };
  }

  async approve(id: string) {
    return this.prisma.review.update({ where: { id }, data: { status: 'APPROVED' } });
  }
}
