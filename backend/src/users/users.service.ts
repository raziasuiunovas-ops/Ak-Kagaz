import {
  Injectable,
  NotFoundException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateAddressDto } from './dto/create-address.dto';
import { UpdateAddressDto } from './dto/update-address.dto';
import { UserStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateUserDto) {
    // Check if user already exists
    const existing = await this.prisma.user.findFirst({
      where: {
        OR: [{ email: dto.email }, ...(dto.phone ? [{ phone: dto.phone }] : [])],
      },
    });

    if (existing) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password if provided
    const passwordHash = dto.password ? await bcrypt.hash(dto.password, 10) : undefined;

    // Create user with profile in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          status: dto.status || UserStatus.ACTIVE,
          locale: dto.locale || 'ru',
          profile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
              middleName: dto.middleName,
              birthDate: dto.birthDate,
              gender: dto.gender,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      // Assign default CUSTOMER role if not specified
      if (!dto.roleIds || dto.roleIds.length === 0) {
        const customerRole = await tx.role.findUnique({
          where: { name: 'CUSTOMER' },
        });

        if (customerRole) {
          await tx.userRole.create({
            data: {
              userId: newUser.id,
              roleId: customerRole.id,
            },
          });
        }
      } else {
        // Assign specified roles
        for (const roleId of dto.roleIds) {
          await tx.userRole.create({
            data: {
              userId: newUser.id,
              roleId,
            },
          });
        }
      }

      return newUser;
    });

    this.logger.log(`User created: ${user.email}`);

    return this.sanitizeUser(user);
  }

  async findAll(params: {
    skip?: number;
    take?: number;
    search?: string;
    status?: UserStatus;
  }) {
    const { skip = 0, take = 20, search, status } = params;

    const where: any = {};

    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
        { profile: { firstName: { contains: search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    if (status) {
      where.status = status;
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take,
        include: {
          profile: true,
          userRoles: {
            include: {
              role: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      data: users.map((user) => this.sanitizeUser(user)),
      pagination: {
        total,
        page: Math.floor(skip / take) + 1,
        pageSize: take,
        totalPages: Math.ceil(total / take),
      },
    };
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        addresses: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return this.sanitizeUser(user);
  }

  async findByEmail(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException(`User with email ${email} not found`);
    }

    return this.sanitizeUser(user);
  }

  async update(id: string, dto: UpdateUserDto) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Check email uniqueness if changing
    if (dto.email && dto.email !== user.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      if (existing) {
        throw new ConflictException('Email already in use');
      }
    }

    // Check phone uniqueness if changing
    if (dto.phone && dto.phone !== user.phone) {
      const existing = await this.prisma.user.findUnique({
        where: { phone: dto.phone },
      });

      if (existing) {
        throw new ConflictException('Phone already in use');
      }
    }

    const updated = await this.prisma.user.update({
      where: { id },
      data: {
        email: dto.email,
        phone: dto.phone,
        status: dto.status,
        locale: dto.locale,
      },
      include: {
        profile: true,
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    this.logger.log(`User updated: ${updated.email}`);

    return this.sanitizeUser(updated);
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    if (user.profile) {
      await this.prisma.userProfile.update({
        where: { userId },
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
          middleName: dto.middleName,
          birthDate: dto.birthDate,
          gender: dto.gender,
          avatarUrl: dto.avatarUrl,
        },
      });
    } else {
      await this.prisma.userProfile.create({
        data: {
          userId,
          firstName: dto.firstName,
          lastName: dto.lastName,
          middleName: dto.middleName,
          birthDate: dto.birthDate,
          gender: dto.gender,
          avatarUrl: dto.avatarUrl,
        },
      });
    }

    return this.findOne(userId);
  }

  async remove(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Soft delete: mark as INACTIVE instead of deleting
    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.INACTIVE },
    });

    this.logger.log(`User deactivated: ${user.email}`);

    return { message: 'User deactivated successfully' };
  }

  async block(id: string, reason?: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.BLOCKED },
    });

    this.logger.warn(`User blocked: ${user.email} - Reason: ${reason || 'Not specified'}`);

    return { message: 'User blocked successfully' };
  }

  async unblock(id: string) {
    const user = await this.prisma.user.findUnique({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    await this.prisma.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE },
    });

    this.logger.log(`User unblocked: ${user.email}`);

    return { message: 'User unblocked successfully' };
  }

  // Address management
  async createAddress(userId: string, dto: CreateAddressDto) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If this is default address, unset other defaults
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true },
        data: { isDefault: false },
      });
    }

    const address = await this.prisma.userAddress.create({
      data: {
        userId,
        ...dto,
      },
    });

    return address;
  }

  async updateAddress(userId: string, addressId: string, dto: UpdateAddressDto) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    // If setting as default, unset other defaults
    if (dto.isDefault) {
      await this.prisma.userAddress.updateMany({
        where: { userId, isDefault: true, id: { not: addressId } },
        data: { isDefault: false },
      });
    }

    return this.prisma.userAddress.update({
      where: { id: addressId },
      data: dto,
    });
  }

  async removeAddress(userId: string, addressId: string) {
    const address = await this.prisma.userAddress.findFirst({
      where: { id: addressId, userId },
    });

    if (!address) {
      throw new NotFoundException('Address not found');
    }

    await this.prisma.userAddress.delete({
      where: { id: addressId },
    });

    return { message: 'Address deleted successfully' };
  }

  async getAddresses(userId: string) {
    return this.prisma.userAddress.findMany({
      where: { userId },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }],
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }
}
