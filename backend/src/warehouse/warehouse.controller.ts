import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { StockAdjustmentDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('warehouse')
@UseGuards(JwtAuthGuard, RolesGuard)
export class WarehouseController {
  constructor(private readonly service: WarehouseService) {}

  @Get('stock')
  @Roles('SUPER_ADMIN', 'ADMIN', 'WAREHOUSE')
  async getStock(@Query('productId') productId: string, @Query('warehouseId') warehouseId?: string) {
    return this.service.getStock(productId, warehouseId);
  }

  @Post('adjust')
  @Roles('SUPER_ADMIN', 'WAREHOUSE')
  async adjustStock(@Body() dto: StockAdjustmentDto, @Request() req: any) {
    return this.service.adjustStock(dto, req.user.userId);
  }
}
