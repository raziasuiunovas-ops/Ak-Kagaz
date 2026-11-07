// @ts-nocheck - class-validator types issue
import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  @IsNotEmpty()
  sessionId!: string;

  @IsString()
  @IsNotEmpty()
  message!: string;

  @IsString()
  @IsOptional()
  userId?: string;

  @IsObject()
  @IsOptional()
  context?: {
    page?: string;
    productId?: string;
    categoryId?: string;
    locale?: string;
  };
}
