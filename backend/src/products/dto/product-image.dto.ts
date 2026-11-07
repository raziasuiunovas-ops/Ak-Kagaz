// @ts-nocheck
import { IsString, IsNotEmpty, IsOptional, IsInt, Min, MaxLength } from 'class-validator';

export class ProductImageDto {
  @IsString()
  @IsNotEmpty({ message: 'Image URL is required' })
  @MaxLength(500, { message: 'Image URL must not exceed 500 characters' })
  url: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Alt text must not exceed 200 characters' })
  altText?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}
