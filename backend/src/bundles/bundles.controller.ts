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
import { BundlesService } from './bundles.service';
import { CreateBundleDto, UpdateBundleDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('bundles')
export class BundlesController {
  constructor(private readonly bundlesService: BundlesService) {}

  /**
   * Create a new product bundle
   * Only SUPER_ADMIN and ADMIN can create bundles
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createBundleDto: CreateBundleDto) {
    return this.bundlesService.create(createBundleDto);
  }

  /**
   * Get all product bundles with optional filters
   * Public endpoint
   */
  @Get()
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('locale') locale?: string,
    @Query('type') type?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const isActiveBool =
      isActive === 'true' ? true : isActive === 'false' ? false : undefined;

    return this.bundlesService.findAll(
      pageNum,
      limitNum,
      locale,
      type,
      isActiveBool,
    );
  }

  /**
   * Get a single bundle by ID
   * Public endpoint
   */
  @Get('id/:id')
  async findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    return this.bundlesService.findOne(id, locale);
  }

  /**
   * Get a bundle by slug
   * Public endpoint
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.bundlesService.findBySlug(slug, locale);
  }

  /**
   * Update a bundle
   * Only SUPER_ADMIN and ADMIN can update bundles
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateBundleDto: UpdateBundleDto,
  ) {
    return this.bundlesService.update(id, updateBundleDto);
  }

  /**
   * Delete a bundle
   * Only SUPER_ADMIN can delete bundles
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.bundlesService.remove(id);
  }
}
