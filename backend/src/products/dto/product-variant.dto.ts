// @ts-nocheck
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, Min, MaxLength, Matches } from 'class-validator';

export class ProductVariantDto {
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  @MaxLength(50, { message: 'SKU must not exceed 50 characters' })
  @Matches(/^[A-Z0-9-_]+$/, { message: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores' })
  sku: string;

  @IsString()
  @IsNotEmpty({ message: 'Variant name is required' })
  @MaxLength(100, { message: 'Variant name must not exceed 100 characters' })
  name: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Image URL must not exceed 500 characters' })
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
