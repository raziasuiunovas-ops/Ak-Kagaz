// @ts-nocheck
import { IsString, IsNotEmpty, IsEnum, IsOptional, IsNumber, Min, MaxLength } from 'class-validator';

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

  // Checkout contact details are saved with this order as a historical snapshot.
  @IsString()
  @IsOptional()
  @MaxLength(50)
  firstName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(50)
  lastName?: string;

  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(500)
  comment?: string;
}

export class UpdateOrderStatusDto {
  @IsEnum(['PENDING', 'CONFIRMED', 'PROCESSING', 'READY', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'])
  status: string;

  @IsString()
  @IsOptional()
  notes?: string;
}
