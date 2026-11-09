// @ts-nocheck
import { IsNumber, IsString, IsBoolean, IsOptional, IsDateString, Min, MaxLength } from 'class-validator';

export class UpdateProductPriceDto {
  @IsNumber()
  @Min(0, { message: 'Purchase price must be at least 0' })
  @IsOptional()
  purchasePrice?: number;

  @IsNumber()
  @Min(0, { message: 'Selling price must be at least 0' })
  @IsOptional()
  sellingPrice?: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsBoolean()
  @IsOptional()
  isEstimate?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  estimateBasis?: string | null;

  @IsDateString()
  @IsOptional()
  effectiveFrom?: string;

  @IsDateString()
  @IsOptional()
  effectiveUntil?: string;
}
