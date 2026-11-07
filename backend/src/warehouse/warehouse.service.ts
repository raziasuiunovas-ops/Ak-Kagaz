import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { StockAdjustmentDto } from './dto';

@Injectable()
export class WarehouseService {
  constructor(private readonly prisma: PrismaService) {}

  async getStock(productId: string, warehouseId?: string) {
    const where: any = { productId };
    if (warehouseId) where.warehouseId = warehouseId;
    return this.prisma.stock.findMany({ where, include: { warehouse: true, product: { include: { translations: true } } } });
  }

  async adjustStock(dto: StockAdjustmentDto, userId: string) {
    const product = await this.prisma.product.findUnique({ where: { id: dto.productId } });
    if (!product) throw new NotFoundException('Product not found');
    const warehouse = await this.prisma.warehouse.findUnique({ where: { id: dto.warehouseId } });
    if (!warehouse) throw new NotFoundException('Warehouse not found');

    return this.prisma.$transaction(async (tx: any) => {
      let stock = await tx.stock.findUnique({ where: { productId_warehouseId: { productId: dto.productId, warehouseId: dto.warehouseId } } });
      if (!stock) {
        stock = await tx.stock.create({ data: { productId: dto.productId, warehouseId: dto.warehouseId, quantity: 0, reserved: 0 } });
      }

      const newQuantity = dto.type === 'SALE' ? stock.quantity - dto.quantity : stock.quantity + dto.quantity;
      await tx.stock.update({ where: { id: stock.id }, data: { quantity: newQuantity } });
      await tx.stockMovement.create({ data: { productId: dto.productId, warehouseId: dto.warehouseId, type: dto.type, quantity: dto.quantity, reason: dto.reason, createdBy: userId } });
      
      return tx.stock.findUnique({ where: { id: stock.id }, include: { warehouse: true, product: { include: { translations: true } } } });
    });
  }

  /**
   * Check if products are available in stock across all warehouses
   * Returns insufficient stock items if any
   */
  async checkAvailability(items: Array<{ productId: string; quantity: number }>) {
    const insufficientStock: Array<{ productId: string; requested: number; available: number }> = [];

    for (const item of items) {
      // Sum available quantity across all warehouses
      const stocks = await this.prisma.stock.findMany({
        where: { productId: item.productId },
        select: { quantity: true, reserved: true },
      });

      const totalAvailable = stocks.reduce((sum, stock) => sum + (stock.quantity - stock.reserved), 0);

      if (totalAvailable < item.quantity) {
        insufficientStock.push({
          productId: item.productId,
          requested: item.quantity,
          available: totalAvailable,
        });
      }
    }

    return insufficientStock;
  }

  /**
   * Reserve stock for an order (within transaction)
   * Uses FIFO: reserves from warehouses with most available stock first
   */
  async reserveStockForOrder(
    orderId: string,
    items: Array<{ productId: string; quantity: number }>,
    tx: any,
  ) {
    const reservations: Array<{ stockId: string; quantity: number }> = [];

    for (const item of items) {
      let remainingQuantity = item.quantity;

      // Get stocks ordered by available quantity (FIFO)
      const stocks = await tx.stock.findMany({
        where: { productId: item.productId },
        orderBy: { quantity: 'desc' },
      });

      for (const stock of stocks) {
        if (remainingQuantity <= 0) break;

        const available = stock.quantity - stock.reserved;
        if (available <= 0) continue;

        const toReserve = Math.min(available, remainingQuantity);

        // Update stock reserved amount
        await tx.stock.update({
          where: { id: stock.id },
          data: { reserved: { increment: toReserve } },
        });

        // Create reservation record
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24); // 24 hours expiry

        await tx.stockReservation.create({
          data: {
            stockId: stock.id,
            orderId,
            quantity: toReserve,
            status: 'ACTIVE',
            expiresAt,
          },
        });

        reservations.push({ stockId: stock.id, quantity: toReserve });
        remainingQuantity -= toReserve;
      }

      if (remainingQuantity > 0) {
        throw new BadRequestException(
          `Insufficient stock for product ${item.productId}. Missing: ${remainingQuantity} units`,
        );
      }
    }

    return reservations;
  }
}
