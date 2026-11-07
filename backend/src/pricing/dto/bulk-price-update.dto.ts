// @ts-nocheck
import { IsArray, IsString, IsNumber, ValidateNested, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';

class PriceUpdateItem {
  @IsString()
  productId: string;

  @IsString()
  tierId: string;

  @IsNumber()
  purchasePrice: number;

  @IsNumber()
  sellingPrice: number;
}

export class BulkPriceUpdateDto {
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one price update is required' })
  @ValidateNested({ each: true })
  @Type(() => PriceUpdateItem)
  prices: PriceUpdateItem[];

  @IsString()
  reason?: string;
}
