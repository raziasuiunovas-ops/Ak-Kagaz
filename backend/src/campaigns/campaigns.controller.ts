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
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  /**
   * Create a new campaign
   * Only SUPER_ADMIN and ADMIN can create campaigns
   */
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createCampaignDto: CreateCampaignDto) {
    return this.campaignsService.create(createCampaignDto);
  }

  /**
   * Get all campaigns with optional filters
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

    return this.campaignsService.findAll(
      pageNum,
      limitNum,
      locale,
      type,
      isActiveBool,
    );
  }

  /**
   * Get active campaigns (currently running)
   * Public endpoint
   */
  @Get('active')
  async findActive(@Query('locale') locale?: string) {
    return this.campaignsService.findActive(locale);
  }

  /**
   * Get a single campaign by ID
   * Public endpoint
   */
  @Get('id/:id')
  async findOne(@Param('id') id: string, @Query('locale') locale?: string) {
    return this.campaignsService.findOne(id, locale);
  }

  /**
   * Get a campaign by slug
   * Public endpoint
   */
  @Get('slug/:slug')
  async findBySlug(
    @Param('slug') slug: string,
    @Query('locale') locale?: string,
  ) {
    return this.campaignsService.findBySlug(slug, locale);
  }

  /**
   * Get campaigns for a specific product
   * Public endpoint
   */
  @Get('product/:productId')
  async getProductCampaigns(
    @Param('productId') productId: string,
    @Query('locale') locale?: string,
  ) {
    return this.campaignsService.getProductCampaigns(productId, locale);
  }

  /**
   * Update a campaign
   * Only SUPER_ADMIN and ADMIN can update campaigns
   */
  @Put(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  /**
   * Delete a campaign
   * Only SUPER_ADMIN can delete campaigns
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.campaignsService.remove(id);
  }
}
