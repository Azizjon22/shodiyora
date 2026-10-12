import { Body, Controller, Post, UnauthorizedException } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { Public } from '../common/decorators/public.decorator';
import { AuthService } from '../auth/auth.service';
import { TelegramService } from './telegram.service';
import { TelegramAuthDto } from './dto/telegram-auth.dto';

/**
 * Lets the Mini App (the web app opened inside Telegram) sign a visitor in
 * without a password/PIN: Telegram's own signed initData, from a chat that
 * was already linked via /start in the bot, is the credential.
 */
@Controller('auth')
export class TelegramAuthController {
  constructor(
    private auth: AuthService,
    private telegram: TelegramService,
  ) {}

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60_000 } })
  @Post('telegram')
  async loginTelegram(@Body() dto: TelegramAuthDto) {
    const chatId = this.telegram.verifyInitData(dto.initData);
    if (!chatId) {
      throw new UnauthorizedException("Telegram ma'lumotlari tasdiqlanmadi");
    }
    return this.auth.loginViaTelegram(chatId);
  }
}
