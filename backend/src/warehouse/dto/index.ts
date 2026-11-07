// @ts-nocheck
import { IsString, IsNotEmpty, IsInt, Min, IsEnum, IsOptional } from 'class-validator';

export class StockAdjustmentDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsString() @IsNotEmpty() warehouseId: string;
  @IsInt() @Min(0) quantity: number;
  @IsEnum(['RECEIPT', 'SALE', 'ADJUSTMENT', 'RETURN']) type: string;
  @IsString() @IsOptional() reason?: string;
}
