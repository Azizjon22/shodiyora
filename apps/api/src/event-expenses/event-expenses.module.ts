import { Module } from '@nestjs/common';
import { EventExpensesController } from './event-expenses.controller';
import { EventExpensesService } from './event-expenses.service';

@Module({
  controllers: [EventExpensesController],
  providers: [EventExpensesService],
})
export class EventExpensesModule {}
