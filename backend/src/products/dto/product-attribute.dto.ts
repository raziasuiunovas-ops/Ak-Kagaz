// @ts-nocheck
import { IsString, IsNotEmpty, MaxLength } from 'class-validator';

export class ProductAttributeDto {
  @IsString()
  @IsNotEmpty({ message: 'Attribute ID is required' })
  attributeId: string;

  @IsString()
  @IsNotEmpty({ message: 'Attribute value is required' })
  @MaxLength(500, { message: 'Attribute value must not exceed 500 characters' })
  value: string;
}
