// @ts-nocheck - class-validator types issue
import { IsEmail } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail()
  email!: string;
}
