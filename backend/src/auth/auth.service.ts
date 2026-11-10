import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { PrismaService } from '../common/services/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import { OAuthProvider, UserStatus } from '@prisma/client';
import { randomBytes } from 'node:crypto';
import { Resend } from 'resend';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(NotificationsService) private readonly notificationsService: NotificationsService,
    @Inject(ConfigService) private readonly config: ConfigService,
  ) {}

  async register(dto: RegisterDto) {
    // Check if user already exists
    const existingUser = await this.prisma.user.findFirst({
      where: {
        OR: [
          { email: dto.email },
          ...(dto.phone ? [{ phone: dto.phone }] : []),
        ],
      },
    });

    if (existingUser) {
      throw new ConflictException('User with this email or phone already exists');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 10);

    // Create user with profile in transaction
    const user = await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: dto.email,
          phone: dto.phone,
          passwordHash,
          status: UserStatus.PENDING_VERIFICATION,
          locale: dto.locale || 'ru',
          profile: {
            create: {
              firstName: dto.firstName,
              lastName: dto.lastName,
            },
          },
        },
        include: {
          profile: true,
        },
      });

      // Assign CUSTOMER role by default
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

      return newUser;
    });

    // TODO: Send email verification
    this.logger.log(`User registered: ${user.email}`);

    // Generate JWT token
    const token = this.generateToken(user.id, user.email);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async login(dto: LoginDto, ipAddress?: string, userAgent?: string) {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Account is blocked');
    }

    // Проверяем, является ли пользователь админом
    const hasAdminRole = user.userRoles.some(
      (ur) =>
        ur.role.name === 'SUPER_ADMIN' ||
        ur.role.name === 'ADMIN' ||
        ur.role.name === 'MANAGER' ||
        ur.role.name === 'WAREHOUSE',
    );

    // Если админ - требуем 2FA
    if (hasAdminRole) {
      const result = await this.notificationsService.create2FACode(
        user.id,
        ipAddress,
        userAgent,
      );

      this.logger.log(`Admin login initiated (2FA required) for: ${user.email}`);

      return {
        userId: user.id,
        email: user.email,
        requires2FA: true,
        codeSent: result.success,
        expiresInMinutes: result.expiresInMinutes,
      };
    }

    // Для обычных пользователей - сразу выдаём токен
    await this.prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    const token = this.generateToken(user.id, user.email);

    this.logger.log(`User logged in: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }

  async validateUser(email: string, password: string) {
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

    if (!user || !user.passwordHash) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    return user;
  }

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('User not found');
    }

    return this.sanitizeUser(user);
  }

  async requestPasswordReset(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { userRoles: { include: { role: true } } },
    });

    if (!user) {
      // Don't reveal if user exists
      return { message: 'If email exists, reset link will be sent' };
    }

    // Check if password reset is enabled (email mode required for production)
    const testMode = this.config.get<string>('PASSWORD_RESET_MODE', 'test') !== 'email';
    if (testMode) {
      // Password reset temporarily disabled until email service is configured
      // This prevents token leakage in API responses
      return { message: 'If email exists, reset link will be sent' };
    }

    // Generate reset token
    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // 1 hour

    await this.prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    const frontendUrl = this.config.get<string>('NEXTAUTH_URL', 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/forgot-password?token=${encodeURIComponent(token)}`;

    // Send password reset email via Resend
    const apiKey = this.config.get<string>('RESEND_API_KEY');
    const from = this.config.get<string>('RESEND_FROM_EMAIL');
    if (!apiKey || !from) {
      throw new BadRequestException('Password reset email is not configured');
    }

    const resend = new Resend(apiKey);
    const isKyrgyz = user.locale === 'ky';
    const { error } = await resend.emails.send({
      from,
      to: user.email,
      subject: isKyrgyz ? 'AK KAGAZ сырсөзүн калыбына келтирүү' : 'Сброс пароля AK KAGAZ',
      html: isKyrgyz
        ? `<p>Сырсөздү өзгөртүү үчүн <a href="${resetUrl}">калыбына келтирүү шилтемесине</a> өтүңүз.</p><p>Шилтеме бир саат жарактуу.</p>`
        : `<p>Чтобы изменить пароль, перейдите по <a href="${resetUrl}">ссылке сброса пароля</a>.</p><p>Ссылка действительна один час.</p>`,
    });
    if (error) {
      this.logger.error('Resend could not deliver a password reset email.', error.message);
      throw new BadRequestException('Could not send password reset email');
    }

    return { message: 'If email exists, reset link will be sent' };
  }

  async loginWithGoogle(profile: {
    providerAccountId: string;
    email: string;
    emailVerified: boolean;
    firstName: string;
    lastName: string;
    avatarUrl?: string;
  }) {
    if (!profile.emailVerified) {
      throw new UnauthorizedException('Google email must be verified');
    }

    const linkedAccount = await this.prisma.oAuthAccount.findUnique({
      where: {
        provider_providerAccountId: {
          provider: OAuthProvider.GOOGLE,
          providerAccountId: profile.providerAccountId,
        },
      },
      include: { user: { include: { profile: true, userRoles: { include: { role: true } } } } },
    });

    let user = linkedAccount?.user;
    if (!user) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: profile.email },
        include: { profile: true, userRoles: { include: { role: true } } },
      });

      if (existingUser?.status === UserStatus.BLOCKED) {
        throw new UnauthorizedException('Account is blocked');
      }

      if (existingUser) {
        user = existingUser;
        if (!user.emailVerified) {
          await this.prisma.user.update({
            where: { id: user.id },
            data: { emailVerified: true },
          });
        }
        if (user.profile && (!user.profile.firstName || !user.profile.lastName) && (profile.firstName || profile.lastName)) {
          await this.prisma.userProfile.update({
            where: { userId: user.id },
            data: {
              firstName: user.profile.firstName || profile.firstName,
              lastName: user.profile.lastName || profile.lastName,
              avatarUrl: user.profile.avatarUrl || profile.avatarUrl,
            },
          });
        }
      } else {
        user = await this.prisma.$transaction(async (tx) => {
          const created = await tx.user.create({
            data: {
              email: profile.email,
              emailVerified: true,
              status: UserStatus.ACTIVE,
              profile: {
                create: {
                  firstName: profile.firstName || null,
                  lastName: profile.lastName || null,
                  avatarUrl: profile.avatarUrl,
                },
              },
            },
            include: { profile: true, userRoles: { include: { role: true } } },
          });
          const customerRole = await tx.role.findUnique({ where: { name: 'CUSTOMER' } });
          if (customerRole) {
            await tx.userRole.create({ data: { userId: created.id, roleId: customerRole.id } });
          }
          return created;
        });
      }

      await this.prisma.oAuthAccount.create({
        data: {
          userId: user.id,
          provider: OAuthProvider.GOOGLE,
          providerAccountId: profile.providerAccountId,
        },
      });
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Account is blocked');
    }

    const isAdmin = user.userRoles.some(({ role }) =>
      ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE'].includes(role.name),
    );
    if (isAdmin) {
      const result = await this.notificationsService.create2FACode(user.id);
      if (!result.success) {
        throw new UnauthorizedException('Could not send the admin verification code');
      }
      return { requires2FA: true as const, userId: user.id };
    }

    await this.prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
    return { user: this.sanitizeUser(user), token: this.generateToken(user.id, user.email) };
  }

  async resetPassword(token: string, newPassword: string) {
    const resetToken = await this.prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      this.prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt: new Date() },
      }),
    ]);

    this.logger.log(`Password reset completed for user: ${resetToken.user.email}`);

    return { message: 'Password successfully reset' };
  }

  private generateToken(userId: string, email: string): string {
    return this.jwtService.sign({
      sub: userId,
      email,
    });
  }

  private sanitizeUser(user: any) {
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  // ============================================================
  // ADMIN LOGIN WITH 2FA
  // ============================================================

  /**
   * Административный вход - этап 1: проверка credentials и отправка 2FA кода
   */
  async adminLogin(
    dto: LoginDto,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const user = await this.validateUser(dto.email, dto.password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Account is blocked');
    }

    // Проверяем роль пользователя (не должен быть просто CUSTOMER)
    const hasAdminRole = user.userRoles.some(
      (ur) =>
        ur.role.name === 'SUPER_ADMIN' ||
        ur.role.name === 'ADMIN' ||
        ur.role.name === 'MANAGER' ||
        ur.role.name === 'WAREHOUSE',
    );

    if (!hasAdminRole) {
      throw new UnauthorizedException('Access denied. Admin role required.');
    }

    // Создаем и отправляем 2FA код
    const result = await this.notificationsService.create2FACode(
      user.id,
      ipAddress,
      userAgent,
    );

    this.logger.log(`Admin login initiated for: ${user.email}, userId: ${user.id}`);

    return {
      userId: user.id,
      email: user.email,
      requires2FA: true,
      codeSent: result.success,
      expiresInMinutes: result.expiresInMinutes,
    };
  }

  /**
   * Административный вход - этап 2: проверка 2FA кода и выдача токена
   */
  async adminVerify2FA(userId: string, code: string) {
    this.logger.log(`Admin 2FA verification attempt for userId: ${userId}`);
    
    // Получаем пользователя
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
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
      throw new UnauthorizedException('User not found');
    }

    if (user.status === UserStatus.BLOCKED) {
      throw new UnauthorizedException('Account is blocked');
    }

    const hasAdminRole = user.userRoles.some((userRole) =>
      ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'WAREHOUSE'].includes(userRole.role.name),
    );
    if (!hasAdminRole) {
      throw new UnauthorizedException('Access denied. Admin role required.');
    }

    const result = await this.notificationsService.verify2FACode(userId, code);
    if (!result.valid) {
      this.logger.warn(`2FA verification failed for userId: ${userId} - ${result.message}`);
      throw new UnauthorizedException(result.message || 'Invalid 2FA code');
    }

    // Обновляем последний вход
    await this.prisma.user.update({
      where: { id: userId },
      data: { lastLoginAt: new Date() },
    });

    // Генерируем токен
    const token = this.generateToken(user.id, user.email);

    this.logger.log(`Admin 2FA verified for: ${user.email}`);

    return {
      user: this.sanitizeUser(user),
      token,
    };
  }
}
