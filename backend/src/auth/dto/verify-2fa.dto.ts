// @ts-nocheck - class-validator types issue
import { IsString, Length } from 'class-validator';

export class Verify2FADto {
  @IsString()
  userId!: string;

  @IsString()
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  code!: string;
}
