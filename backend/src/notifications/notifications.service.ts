import {
  Injectable,
  BadRequestException,
  Logger,
  Inject,
} from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { TelegramService } from './telegram.service';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);
  private readonly CODE_EXPIRY_MINUTES = 5;
  private readonly MAX_ATTEMPTS = 3;

  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(TelegramService) private readonly telegram: TelegramService,
  ) {}

  /**
   * Генерирует 6-значный код
   */
  private generateCode(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  /**
   * Создает и отправляет 2FA код пользователю в Telegram
   */
  async create2FACode(
    userId: string,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<{ success: boolean; expiresInMinutes: number }> {
    // Получаем информацию о пользователе
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Деактивируем все предыдущие коды пользователя
    await this.prisma.twoFactorCode.updateMany({
      where: {
        userId,
        usedAt: null,
      },
      data: {
        usedAt: new Date(),
      },
    });

    // Генерируем новый код
    const code = this.generateCode();
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.CODE_EXPIRY_MINUTES);

    // Сохраняем код в БД
    await this.prisma.twoFactorCode.create({
      data: {
        userId,
        code,
        expiresAt,
        ipAddress,
        userAgent,
      },
    });

    // Отправляем код в Telegram
    const userName = user.profile
      ? `${user.profile.firstName || ''} ${user.profile.lastName || ''}`.trim()
      : user.email;

    const sent = await this.telegram.send2FACode(
      user.email,
      userName || 'Администратор',
      code,
      this.CODE_EXPIRY_MINUTES,
    );

    if (!sent) {
      this.logger.error(`Failed to send 2FA code to Telegram for user ${userId}`);
    }

    this.logger.log(`2FA code created for user ${user.email}`);

    return {
      success: sent,
      expiresInMinutes: this.CODE_EXPIRY_MINUTES,
    };
  }

  /**
   * Проверяет 2FA код
   */
  async verify2FACode(
    userId: string,
    code: string,
  ): Promise<{ valid: boolean; message?: string }> {
    // Находим активный код
    const twoFactorCode = await this.prisma.twoFactorCode.findFirst({
      where: {
        userId,
        usedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    if (!twoFactorCode) {
      return {
        valid: false,
        message: 'Invalid or expired code',
      };
    }

    // Проверяем количество попыток
    if (twoFactorCode.attempts >= this.MAX_ATTEMPTS) {
      await this.prisma.twoFactorCode.update({
        where: { id: twoFactorCode.id },
        data: { usedAt: new Date() },
      });

      return {
        valid: false,
        message: 'Maximum attempts exceeded',
      };
    }

    // Проверяем срок действия
    if (twoFactorCode.expiresAt < new Date()) {
      await this.prisma.twoFactorCode.update({
        where: { id: twoFactorCode.id },
        data: { usedAt: new Date() },
      });

      return {
        valid: false,
        message: 'Code expired',
      };
    }

    // Проверяем код ПЕРЕД увеличением счетчика
    if (twoFactorCode.code !== code) {
      // Увеличиваем счетчик попыток только при неправильном коде
      await this.prisma.twoFactorCode.update({
        where: { id: twoFactorCode.id },
        data: { attempts: { increment: 1 } },
      });

      return {
        valid: false,
        message: 'Invalid code',
      };
    }

    // Код правильный - помечаем как использованный
    await this.prisma.twoFactorCode.update({
      where: { id: twoFactorCode.id },
      data: { usedAt: new Date() },
    });

    this.logger.log(`2FA code verified for user ${userId}`);

    return {
      valid: true,
    };
  }

  /**
   * Очистка просроченных кодов (можно вызывать по расписанию)
   */
  async cleanupExpiredCodes(): Promise<number> {
    const result = await this.prisma.twoFactorCode.deleteMany({
      where: {
        OR: [
          { expiresAt: { lt: new Date() } },
          { usedAt: { not: null } },
        ],
      },
    });

    this.logger.log(`Cleaned up ${result.count} expired 2FA codes`);

    return result.count;
  }
}
