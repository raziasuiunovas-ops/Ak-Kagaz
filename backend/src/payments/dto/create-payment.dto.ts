// @ts-nocheck
import { IsEnum, IsString, IsNumber, IsOptional } from 'class-validator';

export class CreatePaymentDto {
  @IsString()
  orderId: string;

  @IsEnum(['STRIPE', 'PAYPAL', 'MBANK'])
  provider: 'STRIPE' | 'PAYPAL' | 'MBANK';

  @IsEnum(['CARD', 'CASH', 'ONLINE_TRANSFER'])
  method: 'CARD' | 'CASH' | 'ONLINE_TRANSFER';

  @IsNumber()
  amount: number;

  @IsString()
  @IsOptional()
  currency?: string;

  @IsString()
  @IsOptional()
  metadata?: string;
}
