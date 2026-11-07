// @ts-nocheck
import { IsString, IsNotEmpty, IsOptional, MaxLength } from 'class-validator';

export class TranslationDto {
  @IsString()
  @IsNotEmpty({ message: 'Locale is required' })
  locale: 'ru' | 'ky';

  @IsString()
  @IsNotEmpty({ message: 'Name is required' })
  @MaxLength(100, { message: 'Name must not exceed 100 characters' })
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;
}
