// @ts-nocheck
import { IsEnum, IsString, IsOptional } from 'class-validator';

export class PaymentWebhookDto {
  @IsEnum(['STRIPE', 'PAYPAL', 'MBANK'])
  provider: 'STRIPE' | 'PAYPAL' | 'MBANK';

  @IsString()
  eventType: string;

  @IsString()
  @IsOptional()
  paymentId?: string;

  @IsString()
  @IsOptional()
  providerTransactionId?: string;

  @IsEnum(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED'])
  @IsOptional()
  status?: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REFUNDED' | 'CANCELLED';

  payload: any; // Raw webhook payload
}
