import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async getCart(@Request() req: any) {
    return this.cartService.getOrCreateCart(req.user.userId);
  }

  @Post('items')
  @UseGuards(JwtAuthGuard)
  async addItem(@Body() dto: AddToCartDto, @Request() req: any) {
    return this.cartService.addItem(dto, req.user.userId);
  }

  @Put(':cartId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  async updateItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string, @Body() dto: UpdateCartItemDto) {
    return this.cartService.updateItem(cartId, itemId, dto);
  }

  @Delete(':cartId/items/:itemId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeItem(@Param('cartId') cartId: string, @Param('itemId') itemId: string) {
    await this.cartService.removeItem(cartId, itemId);
  }

  @Delete(':cartId')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async clearCart(@Param('cartId') cartId: string) {
    await this.cartService.clearCart(cartId);
  }
}
