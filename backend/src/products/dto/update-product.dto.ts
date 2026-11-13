// @ts-nocheck
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTranslationDto } from './product-translation.dto';
import { ProductVariantDto } from './product-variant.dto';
import { ProductImageDto } from './product-image.dto';
import { ProductAttributeDto } from './product-attribute.dto';

export class UpdateProductDto {
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'SKU must not exceed 50 characters' })
  @Matches(/^[A-Z0-9-_]+$/, {
    message: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  sku?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Slug must not exceed 200 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsString()
  @IsOptional()
  brandId?: string | null;

  @IsEnum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;


  @IsBoolean()
  @IsOptional()
  hasVariants?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Thumbnail URL must not exceed 500 characters' })
  thumbnailUrl?: string | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  length?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  width?: number | null;

  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number | null;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations?: ProductTranslationDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductVariantDto)
  variants?: ProductVariantDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductImageDto)
  images?: ProductImageDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => ProductAttributeDto)
  attributes?: ProductAttributeDto[];
}
