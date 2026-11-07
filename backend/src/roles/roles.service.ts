import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import {
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionsDto,
  AssignRoleDto,
} from './dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new role
   */
  async create(createRoleDto: CreateRoleDto) {
    const { name, description } = createRoleDto;

    // Check if role already exists
    const existingRole = await this.prisma.role.findUnique({
      where: { name },
    });

    if (existingRole) {
      throw new ConflictException(`Role with name "${name}" already exists`);
    }

    return this.prisma.role.create({
      data: {
        name,
        displayNameRu: description || name,
        displayNameKy: description || name,
        description,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Get all roles with pagination
   */
  async findAll(page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [roles, total] = await Promise.all([
      this.prisma.role.findMany({
        skip,
        take: limit,
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
          userRoles: {
            select: {
              userId: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
      this.prisma.role.count(),
    ]);

    return {
      data: roles.map((role: any) => ({
        ...role,
        permissions: role.rolePermissions.map((rp: any) => rp.permission),
        userCount: role.userRoles.length,
        rolePermissions: undefined,
        userRoles: undefined,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Get a single role by ID
   */
  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        userRoles: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                profile: {
                  select: {
                    firstName: true,
                    lastName: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    const roleData = role as any;
    return {
      ...roleData,
      permissions: roleData.rolePermissions.map((rp: any) => rp.permission),
      users: roleData.userRoles.map((ur: any) => ur.user),
      rolePermissions: undefined,
      userRoles: undefined,
    };
  }

  /**
   * Update a role
   */
  async update(id: string, updateRoleDto: UpdateRoleDto) {
    const { name, description } = updateRoleDto;

    // Check if role exists
    const existingRole = await this.prisma.role.findUnique({
      where: { id },
    });

    if (!existingRole) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    // If name is being updated, check for conflicts
    if (name && name !== existingRole.name) {
      const roleWithSameName = await this.prisma.role.findUnique({
        where: { name },
      });

      if (roleWithSameName) {
        throw new ConflictException(`Role with name "${name}" already exists`);
      }
    }

    return this.prisma.role.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(description !== undefined && { description }),
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });
  }

  /**
   * Delete a role
   */
  async remove(id: string) {
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id },
      include: {
        userRoles: true,
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    // Check if role is assigned to any users
    if (role.userRoles.length > 0) {
      throw new BadRequestException(
        `Cannot delete role "${role.name}" because it is assigned to ${role.userRoles.length} user(s)`,
      );
    }

    // Use transaction to delete role and its permissions
    return this.prisma.$transaction(async (tx: any) => {
      // Delete role permissions first
      await tx.rolePermission.deleteMany({
        where: { roleId: id },
      });

      // Delete role
      return tx.role.delete({
        where: { id },
      });
    });
  }

  /**
   * Assign permissions to a role
   */
  async assignPermissions(roleId: string, dto: AssignPermissionsDto) {
    const { permissionIds } = dto;

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Verify all permissions exist
    const permissions = await this.prisma.permission.findMany({
      where: {
        id: { in: permissionIds },
      },
    });

    if (permissions.length !== permissionIds.length) {
      const foundIds = permissions.map((p: any) => p.id);
      const notFoundIds = permissionIds.filter((id) => !foundIds.includes(id));
      throw new NotFoundException(
        `Permissions not found: ${notFoundIds.join(', ')}`,
      );
    }

    // Use transaction to replace all permissions
    return this.prisma.$transaction(async (tx: any) => {
      // Delete existing permissions
      await tx.rolePermission.deleteMany({
        where: { roleId },
      });

      // Create new permissions
      await tx.rolePermission.createMany({
        data: permissionIds.map((permissionId) => ({
          roleId,
          permissionId,
        })),
      });

      // Return updated role
      return tx.role.findUnique({
        where: { id: roleId },
        include: {
          rolePermissions: {
            include: {
              permission: true,
            },
          },
        },
      });
    });
  }

  /**
   * Revoke a specific permission from a role
   */
  async revokePermission(roleId: string, permissionId: string) {
    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if permission exists
    const permission = await this.prisma.permission.findUnique({
      where: { id: permissionId },
    });

    if (!permission) {
      throw new NotFoundException(
        `Permission with ID "${permissionId}" not found`,
      );
    }

    // Check if role has this permission
    const rolePermission = await this.prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    if (!rolePermission) {
      throw new NotFoundException(
        `Role "${role.name}" does not have permission "${permission.name}"`,
      );
    }

    // Delete the role permission
    await this.prisma.rolePermission.delete({
      where: {
        roleId_permissionId: {
          roleId,
          permissionId,
        },
      },
    });

    return {
      message: `Permission "${permission.name}" revoked from role "${role.name}"`,
    };
  }

  /**
   * Assign a role to a user
   */
  async assignRoleToUser(dto: AssignRoleDto) {
    const { userId, roleId } = dto;

    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if user already has this role
    const existingUserRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (existingUserRole) {
      throw new ConflictException(
        `User already has role "${role.name}"`,
      );
    }

    // Assign role to user
    return this.prisma.userRole.create({
      data: {
        userId,
        roleId,
      },
      include: {
        role: true,
        user: {
          select: {
            id: true,
            email: true,
            profile: {
              select: {
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });
  }

  /**
   * Revoke a role from a user
   */
  async revokeRoleFromUser(userId: string, roleId: string) {
    // Check if user exists
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${userId}" not found`);
    }

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    // Check if user has this role
    const userRole = await this.prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    if (!userRole) {
      throw new NotFoundException(
        `User does not have role "${role.name}"`,
      );
    }

    // Remove role from user
    await this.prisma.userRole.delete({
      where: {
        userId_roleId: {
          userId,
          roleId,
        },
      },
    });

    return {
      message: `Role "${role.name}" revoked from user "${user.email}"`,
    };
  }

  /**
   * Get all permissions for a specific role
   */
  async getRolePermissions(roleId: string) {
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    return {
      roleId: role.id,
      roleName: role.name,
      permissions: role.rolePermissions.map((rp: any) => rp.permission),
    };
  }

  /**
   * Check if a user has a specific permission (via their roles)
   */
  async userHasPermission(userId: string, permissionName: string): Promise<boolean> {
    const userRoles = await this.prisma.userRole.findMany({
      where: { userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    // Check if any of the user's roles has the required permission
    return userRoles.some((userRole: any) =>
      userRole.role.rolePermissions.some(
        (rp: any) => rp.permission.name === permissionName,
      ),
    );
  }

  /**
   * Get all users with a specific role
   */
  async getUsersByRole(roleId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    // Check if role exists
    const role = await this.prisma.role.findUnique({
      where: { id: roleId },
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${roleId}" not found`);
    }

    const [userRoles, total] = await Promise.all([
      this.prisma.userRole.findMany({
        where: { roleId },
        skip,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              email: true,
              phone: true,
              status: true,
              emailVerified: true,
              createdAt: true,
              profile: {
                select: {
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
        orderBy: {
          assignedAt: 'desc',
        },
      }),
      this.prisma.userRole.count({
        where: { roleId },
      }),
    ]);

    return {
      data: userRoles.map((ur: any) => ({
        ...ur.user,
        assignedAt: ur.assignedAt,
      })),
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        roleName: role.name,
      },
    };
  }
}
