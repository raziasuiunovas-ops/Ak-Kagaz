import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from './dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, RolesGuard)
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  /**
   * Create a new role
   * Only SUPER_ADMIN can create roles
   */
  @Post()
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createRoleDto: CreateRoleDto) {
    return this.rolesService.create(createRoleDto);
  }

  /**
   * Get all roles with pagination
   * SUPER_ADMIN and ADMIN can view all roles
   */
  @Get()
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.rolesService.findAll(pageNum, limitNum);
  }

  /**
   * Get a single role by ID
   * SUPER_ADMIN and ADMIN can view role details
   */
  @Get(':id')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async findOne(@Param('id') id: string) {
    return this.rolesService.findOne(id);
  }

  /**
   * Update a role
   * Only SUPER_ADMIN can update roles
   */
  @Put(':id')
  @Roles('SUPER_ADMIN')
  async update(
    @Param('id') id: string,
    @Body() updateRoleDto: UpdateRoleDto,
  ) {
    return this.rolesService.update(id, updateRoleDto);
  }

  /**
   * Delete a role
   * Only SUPER_ADMIN can delete roles
   */
  @Delete(':id')
  @Roles('SUPER_ADMIN')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string) {
    await this.rolesService.remove(id);
  }

  /**
   * Assign permissions to a role
   * Only SUPER_ADMIN can assign permissions
   */
  @Post(':id/permissions')
  @Roles('SUPER_ADMIN')
  async assignPermissions(
    @Param('id') roleId: string,
    @Body() assignPermissionsDto: AssignPermissionsDto,
  ) {
    return this.rolesService.assignPermissions(roleId, assignPermissionsDto);
  }

  /**
   * Get all permissions for a role
   * SUPER_ADMIN and ADMIN can view role permissions
   */
  @Get(':id/permissions')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getRolePermissions(@Param('id') roleId: string) {
    return this.rolesService.getRolePermissions(roleId);
  }

  /**
   * Revoke a specific permission from a role
   * Only SUPER_ADMIN can revoke permissions
   */
  @Delete(':roleId/permissions/:permissionId')
  @Roles('SUPER_ADMIN')
  async revokePermission(
    @Param('roleId') roleId: string,
    @Param('permissionId') permissionId: string,
  ) {
    return this.rolesService.revokePermission(roleId, permissionId);
  }

  /**
   * Assign a role to a user
   * SUPER_ADMIN and ADMIN can assign roles
   */
  @Post('assign')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async assignRoleToUser(@Body() assignRoleDto: AssignRoleDto) {
    return this.rolesService.assignRoleToUser(assignRoleDto);
  }

  /**
   * Revoke a role from a user
   * SUPER_ADMIN and ADMIN can revoke roles
   */
  @Delete('users/:userId/roles/:roleId')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async revokeRoleFromUser(
    @Param('userId') userId: string,
    @Param('roleId') roleId: string,
  ) {
    return this.rolesService.revokeRoleFromUser(userId, roleId);
  }

  /**
   * Get all users with a specific role
   * SUPER_ADMIN and ADMIN can view users by role
   */
  @Get(':id/users')
  @Roles('SUPER_ADMIN', 'ADMIN')
  async getUsersByRole(
    @Param('id') roleId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    return this.rolesService.getUsersByRole(roleId, pageNum, limitNum);
  }
}
