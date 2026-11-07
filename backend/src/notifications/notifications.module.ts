import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { NotificationsService } from './notifications.service';
import { TelegramService } from './telegram.service';
import { PrismaService } from '../common/services/prisma.service';

@Module({
  imports: [ConfigModule],
  providers: [NotificationsService, TelegramService, PrismaService],
  exports: [NotificationsService, TelegramService],
})
export class NotificationsModule {}
