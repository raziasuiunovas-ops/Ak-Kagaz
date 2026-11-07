// @ts-nocheck - class-validator types issue
import {
  IsString,
  IsOptional,
  IsBoolean,
  IsNumber,
  IsArray,
  ValidateNested,
  IsNotEmpty,
  IsDateString,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

class CampaignTranslationDto {
  @IsString()
  @IsNotEmpty()
  locale!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsString()
  @IsOptional()
  description?: string;
}

class CampaignProductDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;
}

export class CreateCampaignDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  type!: string; // 'BACK_TO_SCHOOL' | 'NEW_YEAR' | 'EXAM_PREP' | 'SPECIAL_OFFER'

  @IsString()
  @IsOptional()
  bannerUrl?: string;

  @IsString()
  @IsOptional()
  badgeText?: string;

  @IsString()
  @IsOptional()
  backgroundColor?: string;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @IsDateString()
  startDate!: string;

  @IsDateString()
  endDate!: string;

  @IsNumber()
  @Min(0)
  @IsOptional()
  sortOrder?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignTranslationDto)
  translations!: CampaignTranslationDto[];

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CampaignProductDto)
  products!: CampaignProductDto[];
}
