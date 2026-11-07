// @ts-nocheck
import { IsString, IsNotEmpty, IsOptional, IsInt, IsNumber, IsBoolean, Min, Max, MaxLength, Matches } from 'class-validator';

export class CreatePriceTierDto {
  @IsString()
  @IsNotEmpty({ message: 'Tier name is required' })
  @MaxLength(50, { message: 'Tier name must not exceed 50 characters' })
  @Matches(/^[A-Z_]+$/, { message: 'Tier name must contain only uppercase letters and underscores' })
  name: string;

  @IsString()
  @IsNotEmpty({ message: 'Russian display name is required' })
  @MaxLength(100, { message: 'Russian display name must not exceed 100 characters' })
  displayNameRu: string;

  @IsString()
  @IsNotEmpty({ message: 'Kyrgyz display name is required' })
  @MaxLength(100, { message: 'Kyrgyz display name must not exceed 100 characters' })
  displayNameKy: string;

  @IsString()
  @IsOptional()
  @MaxLength(500, { message: 'Description must not exceed 500 characters' })
  description?: string;

  @IsInt()
  @Min(1, { message: 'Minimum quantity must be at least 1' })
  @IsOptional()
  minQuantity?: number;

  @IsNumber()
  @Min(0, { message: 'Discount percent must be at least 0' })
  @Max(100, { message: 'Discount percent must not exceed 100' })
  @IsOptional()
  discountPercent?: number;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
