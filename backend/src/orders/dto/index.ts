// @ts-nocheck
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min } from 'class-validator';

export class CreateOrderDto {
  @IsEnum(['DELIVERY', 'PICKUP'])
  fulfillmentType: 'DELIVERY' | 'PICKUP';

  @IsString()
  @IsOptional()
  deliveryAddressId?: string;

  @IsString()
  @IsOptional()
  billingAddressId?: string;

  @IsString()
  @IsOptional()
  pickupLocationId?: string;

  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
