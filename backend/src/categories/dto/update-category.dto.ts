// @ts-nocheck
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsInt,
  Min,
  MaxLength,
  Matches,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { TranslationDto } from './translation.dto';

export class UpdateCategoryDto {
  @IsString()
  @IsOptional()
  @MaxLength(100, { message: 'Slug must not exceed 100 characters' })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'Slug must be lowercase alphanumeric with hyphens',
  })
  slug?: string;

  @IsString()
  @IsOptional()
  parentId?: string | null;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Image URL must not exceed 500 characters' })
  imageUrl?: string | null;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => TranslationDto)
  translations?: TranslationDto[];
}
