// @ts-nocheck - class-validator types issue
import { IsString, Length, Matches } from 'class-validator';

export class Verify2FADto {
  @IsString()
  userId!: string;

  @IsString()
  @Length(6, 6, { message: 'Code must be exactly 6 digits' })
  @Matches(/^\d{6}$/, { message: 'Code must contain only digits' })
  code!: string;
}
