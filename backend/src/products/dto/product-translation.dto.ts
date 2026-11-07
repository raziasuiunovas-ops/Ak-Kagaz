// @ts-nocheck
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class ProductTranslationDto {
  @IsString()
  @IsNotEmpty({ message: 'Locale is required' })
  locale: 'ru' | 'ky';

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(200, { message: 'Name must not exceed 200 characters' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000, { message: 'Short description must not exceed 1000 characters' })
  shortDescription?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Meta title must not exceed 200 characters' })
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Meta description must not exceed 500 characters' })
  metaDescription?: string;
}
