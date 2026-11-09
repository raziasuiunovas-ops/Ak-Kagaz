// @ts-nocheck
import { IsString, IsNotEmpty, IsOptional, IsBoolean, IsInt, IsNumber, IsPositive, Min, MaxLength, Matches } from 'class-validator';

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

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Russian name must not exceed 100 characters' })
  nameRu?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Kyrgyz name must not exceed 100 characters' })
  nameKy?: string;

  @IsNumber()
  @IsPositive({ message: 'Price must be a positive number' })
  @IsOptional()
  price?: number;

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
