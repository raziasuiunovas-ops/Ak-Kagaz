import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus, ForbiddenException } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto, UpdateOrderStatusDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('orders')
@UseGuards(JwtAuthGuard)
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateOrderDto, @Request() req: any) {
    return this.ordersService.create(dto, req.user.userId);
  }

  @Get()
  async findAll(
    @Request() req: any,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    // Regular users see only their orders
    const isCustomer = req.user.roles && req.user.roles.includes('CUSTOMER') && !req.user.roles.includes('ADMIN') && !req.user.roles.includes('SUPER_ADMIN');
    const userId = isCustomer ? req.user.userId : undefined;
    return this.ordersService.findAll(pageNum, limitNum, userId, status);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    // Check if user has admin role
    const isAdmin = req.user.roles && (req.user.roles.includes('ADMIN') || req.user.roles.includes('SUPER_ADMIN') || req.user.roles.includes('MANAGER'));
    
    const order = await this.ordersService.findOne(id);
    
    // Regular users can only see their own orders
    if (!isAdmin && order.userId !== req.user.userId) {
      throw new ForbiddenException('You can only view your own orders');
    }
    
    return order;
  }

  @Put(':id/status')
  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN', 'MANAGER')
  async updateStatus(@Param('id') id: string, @Body() dto: UpdateOrderStatusDto, @Request() req: any) {
    return this.ordersService.updateStatus(id, dto, req.user.userId);
  }

  @Post(':id/cancel')
  async cancel(@Param('id') id: string, @Body('reason') reason: string, @Request() req: any) {
    return this.ordersService.cancel(id, reason, req.user.userId);
  }
}
