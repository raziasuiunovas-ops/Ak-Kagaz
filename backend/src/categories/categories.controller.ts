import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto, UpdateCategoryDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  /**
   * Create a new category
   * Only SUPER_ADMIN and ADMIN can create categories
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCategoryDto: CreateCategoryDto) {
    return this.categoriesService.create(createCategoryDto);
  }

  /**
   * Get all categories with optional filters
   * Public endpoint
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
    @Query('parentId') parentId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 50;
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.categoriesService.findAll(
      pageNum,
      limitNum,
      locale,
      parentId,
      isActiveBool,
    );
  }

  /**
   * Get category tree (hierarchical structure)
   * Public endpoint
   */
  @Get('tree')
  async getTree(
    @Query('locale') locale?: string,
    @Query('isActive') isActive?: string,
  ) {
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.categoriesService.getTree(locale, isActiveBool);
  }

  /**
   * Get a single category by ID
   * Public endpoint
   */
  @Get('id/:id')
  async findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ) {
    return this.categoriesService.findOne(id, locale);
  }

  /**
   * Get a category by slug
   * Public endpoint
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.categoriesService.findBySlug(slug, locale);
  }

  /**
   * Update a category
   * Only SUPER_ADMIN and ADMIN can update categories
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateCategoryDto: UpdateCategoryDto,
  ) {
    return this.categoriesService.update(id, updateCategoryDto);
  }

  /**
   * Delete a category
   * Only SUPER_ADMIN can delete categories
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.categoriesService.remove(id);
  }

  /**
   * Reorder categories
   * Only SUPER_ADMIN and ADMIN can reorder
   */
  @Post('reorder')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async reorder(@Body('categoryIds') categoryIds: string[]) {
    return this.categoriesService.reorder(categoryIds);
  }
}
