// @ts-nocheck
import { IsString, IsOptional, IsObject } from 'class-validator';

export class ChatRequestDto {
  @IsString()
  message: string;

  @IsString()
  sessionId: string;

  @IsObject()
  @IsOptional()
  context?: {
    page?: string;
    locale?: string;
  };
}
