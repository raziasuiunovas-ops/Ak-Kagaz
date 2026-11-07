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
import { ProductsService } from './products.service';
import { CreateProductDto, UpdateProductDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  /**
   * Create a new product
   * Only SUPER_ADMIN and ADMIN can create products
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createProductDto: CreateProductDto) {
    return this.productsService.create(createProductDto);
  }

  /**
   * Get all products with optional filters
   * Public endpoint
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
    @Query('categoryId') categoryId?: string,
    @Query('brandId') brandId?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;

    return this.productsService.findAll(
      pageNum,
      limitNum,
      locale,
      categoryId,
      brandId,
      status,
      search,
    );
  }

  /**
   * Get a single product by ID
   * Public endpoint
   */
  @Get('id/:id')
  async findOne(
    @Param('id') id: string,
    @Query('locale') locale?: string,
  ) {
    return this.productsService.findOne(id, locale);
  }

  /**
   * Get a product by slug
   * Public endpoint
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.productsService.findBySlug(slug, locale);
  }

  /**
   * Get a product by SKU
   * Public endpoint
   */
  @Get('sku/:sku')
  async getBySku(@Param('sku') sku: string) {
    return this.productsService.getBySku(sku);
  }

  /**
   * Update a product
   * Only SUPER_ADMIN and ADMIN can update products
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateProductDto: UpdateProductDto,
  ) {
    return this.productsService.update(id, updateProductDto);
  }

  /**
   * Delete a product
   * Only SUPER_ADMIN can delete products
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.productsService.remove(id);
  }
}
