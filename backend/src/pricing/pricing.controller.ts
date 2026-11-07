import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, HttpCode, HttpStatus, Request } from '@nestjs/common';
import { PricingService } from './pricing.service';
import { CreatePriceTierDto, UpdatePriceTierDto, CreateProductPriceDto, UpdateProductPriceDto, BulkPriceUpdateDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('pricing')
export class PricingController {
  constructor(private readonly pricingService: PricingService) {}

  // PRICE TIERS
  @Post('tiers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createTier(@Body() dto: CreatePriceTierDto) {
    return this.pricingService.createTier(dto);
  }

  @Get('tiers')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  async findAllTiers(@Query('page') page?: string, @Query('limit') limit?: string, @Query('isActive') isActive?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.pricingService.findAllTiers(pageNum, limitNum, isActiveBool);
  }

  @Get('tiers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  async findOneTier(@Param('id') id: string) {
    return this.pricingService.findOneTier(id);
  }

  @Put('tiers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updateTier(@Param('id') id: string, @Body() dto: UpdatePriceTierDto) {
    return this.pricingService.updateTier(id, dto);
  }

  @Delete('tiers/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeTier(@Param('id') id: string) {
    await this.pricingService.removeTier(id);
  }

  // PRODUCT PRICES
  @Post('prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async createPrice(@Body() dto: CreateProductPriceDto, @Request() req: any) {
    return this.pricingService.createPrice(dto, req.user?.userId);
  }

  @Get('prices')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  async findAllPrices(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('productId') productId?: string,
    @Query('tierId') tierId?: string,
    @Query('isActive') isActive?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const isActiveBool = isActive === 'true' ? true : isActive === 'false' ? false : undefined;
    return this.pricingService.findAllPrices(pageNum, limitNum, productId, tierId, isActiveBool);
  }

  @Get('prices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  async findOnePrice(@Param('id') id: string) {
    return this.pricingService.findOnePrice(id);
  }

  @Put('prices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async updatePrice(@Param('id') id: string, @Body() dto: UpdateProductPriceDto, @Request() req: any) {
    return this.pricingService.updatePrice(id, dto, req.user?.userId);
  }

  @Delete('prices/:id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removePrice(@Param('id') id: string) {
    await this.pricingService.removePrice(id);
  }

  @Get('history/:productId')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  async getPriceHistory(@Param('productId') productId: string, @Query('page') page?: string, @Query('limit') limit?: string) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.pricingService.getPriceHistory(productId, pageNum, limitNum);
  }

  @Post('prices/bulk')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  async bulkUpdatePrices(@Body() dto: BulkPriceUpdateDto, @Request() req: any) {
    return this.pricingService.bulkUpdatePrices(dto, req.user?.userId);
  }
}
