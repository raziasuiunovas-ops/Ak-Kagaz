// @ts-nocheck
import { IsString, IsNotEmpty, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateReviewDto {
  @IsString() @IsNotEmpty() productId: string;
  @IsInt() @Min(1) @Max(5) rating: number;
  @IsString() @IsOptional() comment?: string;
}
