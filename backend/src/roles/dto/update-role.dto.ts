// @ts-nocheck
import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';

export class UpdateRoleDto {
  @IsString()
  @IsOptional()
  @MaxLength(50, { message: 'Role name must not exceed 50 characters' })
  @Matches(/^[A-Z_]+$/, {
    message: 'Role name must contain only uppercase letters and underscores',
  })
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200, { message: 'Description must not exceed 200 characters' })
  description?: string;
}
