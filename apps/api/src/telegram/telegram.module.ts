import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DashboardModule } from '../dashboard/dashboard.module';
import { TelegramService } from './telegram.service';
import { TelegramAuthController } from './telegram-auth.controller';

@Module({
  imports: [AuthModule, DashboardModule],
  controllers: [TelegramAuthController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
