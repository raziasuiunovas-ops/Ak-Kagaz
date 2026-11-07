// @ts-nocheck
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsEnum,
  Min,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductTranslationDto } from './product-translation.dto';
import { ProductVariantDto } from './product-variant.dto';
import { ProductImageDto } from './product-image.dto';
import { ProductAttributeDto } from './product-attribute.dto';

export class CreateProductDto {
  @IsString()
  @IsNotEmpty({ message: 'SKU is required' })
  @MaxLength(50, { message: 'SKU must not exceed 50 characters' })
  @Matches(/^[A-Z0-9-_]+$/, {
    message: 'SKU must contain only uppercase letters, numbers, hyphens, and underscores',
  })
  sku: string;

  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(200, { message: 'Slug must not exceed 200 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @IsString()
  @IsNotEmpty({ message: 'Category ID is required' })
  categoryId: string;

  @IsString()
  @IsOptional()
  brandId?: string;

  @IsEnum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK', 'DISCONTINUED'])
  @IsOptional()
  status?: 'ACTIVE' | 'INACTIVE' | 'OUT_OF_STOCK' | 'DISCONTINUED';

  @IsBoolean()
  @IsOptional()
  hasVariants?: boolean;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Thumbnail URL must not exceed 500 characters' })
  thumbnailUrl?: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  weight?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  length?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  width?: number;

  @IsNumber()
  @Min(0)
  @IsOptional()
  height?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one translation is required' })
  @ValidateNested({ each: true })
  @Type(() => ProductTranslationDto)
  translations: ProductTranslationDto[];

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
