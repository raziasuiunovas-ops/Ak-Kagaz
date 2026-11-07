import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('reviews')
export class ReviewsController {
  constructor(private readonly service: ReviewsService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateReviewDto, @Request() req: any) {
    return this.service.create(dto, req.user.userId);
  }

  @Get()
  async findAll(@Query('page') page?: string, @Query('limit') limit?: string, @Query('productId') productId?: string, @Query('status') status?: string) {
    return this.service.findAll(page ? +page : 1, limit ? +limit : 20, productId, status);
  }

  @Put(':id/approve')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async approve(@Param('id') id: string) {
    return this.service.approve(id);
  }
}
