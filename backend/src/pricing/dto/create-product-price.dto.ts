// @ts-nocheck
import { IsString, IsNotEmpty, IsNumber, IsBoolean, IsOptional, IsDateString, Min } from 'class-validator';

export class CreateProductPriceDto {
  @IsString()
  @IsNotEmpty({ message: 'Product ID is required' })
  productId: string;

  @IsString()
  @IsNotEmpty({ message: 'Tier ID is required' })
  tierId: string;

  @IsNumber()
  @Min(0, { message: 'Purchase price must be at least 0' })
  purchasePrice: number;

  @IsNumber()
  @Min(0, { message: 'Selling price must be at least 0' })
  sellingPrice: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveUntil?: string;
}
