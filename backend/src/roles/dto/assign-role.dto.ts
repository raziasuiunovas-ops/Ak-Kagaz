// @ts-nocheck
import { IsString, IsNotEmpty } from 'class-validator';

export class AssignRoleDto {
  @IsString({ message: 'User ID must be a string' })
  @IsNotEmpty({ message: 'User ID is required' })
  userId: string;

  @IsString({ message: 'Role ID must be a string' })
  @IsNotEmpty({ message: 'Role ID is required' })
  roleId: string;
}
