import { Injectable, Logger, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class TelegramService {
  private readonly logger = new Logger(TelegramService.name);
  private readonly botToken: string;
  private readonly chatId: string;
  private readonly apiUrl: string;

  constructor(@Inject(ConfigService) private readonly configService: ConfigService) {
    this.botToken = this.configService.get<string>('TELEGRAM_BOT_TOKEN') || '';
    this.chatId = this.configService.get<string>('TELEGRAM_CHAT_ID') || '';
    this.apiUrl = `https://api.telegram.org/bot${this.botToken}`;

    if (!this.botToken || !this.chatId) {
      this.logger.warn('Telegram credentials not configured');
    }
  }

  async sendMessage(text: string, chatId?: string): Promise<boolean> {
    if (!this.botToken || !this.chatId) {
      this.logger.error('Telegram not configured. Cannot send message.');
      return false;
    }

    const targetChatId = chatId || this.chatId;

    try {
      const response = await fetch(`${this.apiUrl}/sendMessage`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chat_id: targetChatId,
          text,
          parse_mode: 'HTML',
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        this.logger.error(`Telegram API error: ${error}`);
        return false;
      }

      this.logger.log(`Message sent to Telegram chat ${targetChatId}`);
      return true;
    } catch (error) {
      this.logger.error('Failed to send Telegram message', error);
      return false;
    }
  }

  async send2FACode(
    userEmail: string,
    userName: string,
    code: string,
    expiresInMinutes: number = 5,
  ): Promise<boolean> {
    const message = `
🔐 <b>Код двухфакторной аутентификации</b>

👤 Пользователь: <b>${userName}</b>
📧 Email: <code>${userEmail}</code>

🔢 Код подтверждения: <b>${code}</b>

⏱ Код действителен <b>${expiresInMinutes} минут</b>

⚠️ Если это были не вы, немедленно обратитесь к администратору.
    `.trim();

    return this.sendMessage(message);
  }

  async sendAdminNotification(
    title: string,
    message: string,
    data?: Record<string, any>,
  ): Promise<boolean> {
    let text = `<b>${title}</b>\n\n${message}`;

    if (data) {
      text += '\n\n<b>Детали:</b>';
      for (const [key, value] of Object.entries(data)) {
        text += `\n• ${key}: <code>${value}</code>`;
      }
    }

    return this.sendMessage(text);
  }
}
