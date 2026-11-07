// @ts-nocheck
import { IsArray, IsString, ArrayNotEmpty, ArrayUnique } from 'class-validator';

export class AssignPermissionsDto {
  @IsArray({ message: 'Permission IDs must be an array' })
  @ArrayNotEmpty({ message: 'At least one permission ID is required' })
  @ArrayUnique({ message: 'Permission IDs must be unique' })
  @IsString({ each: true, message: 'Each permission ID must be a string' })
  permissionIds: string[];
}
