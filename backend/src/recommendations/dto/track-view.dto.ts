// @ts-nocheck - class-validator types issue
import { IsString, IsOptional, IsNotEmpty } from 'class-validator';

export class TrackViewDto {
  @IsString()
  @IsNotEmpty()
  productId!: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsString()
  @IsOptional()
  sessionId?: string;
}
