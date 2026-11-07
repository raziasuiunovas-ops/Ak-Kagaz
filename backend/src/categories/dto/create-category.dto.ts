// @ts-nocheck
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TranslationDto } from './translation.dto';

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty({ message: 'Slug is required' })
  @MaxLength(100, { message: 'Slug must not exceed 100 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug: string;

  @IsString()
  @IsOptional()
  parentId?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Image URL must not exceed 500 characters' })
  imageUrl?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @ArrayMinSize(1, { message: 'At least one translation is required' })
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations: TranslationDto[];
}
