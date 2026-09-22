import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthPayload } from '../common/types/auth-payload';
import { EventsService } from './events.service';
import { CreateEventDto } from './dto/create-event.dto';
import { UpdateEventDto } from './dto/update-event.dto';
import { UpdateEventStatusDto } from './dto/update-event-status.dto';
import { AssignWorkerDto } from './dto/assign-worker.dto';
import { FindEventsQuery } from './dto/find-events.query';

function hideFinancials(event: Record<string, unknown>) {
  const {
    totalPrice: _totalPrice,
    paidAmount: _paidAmount,
    balance: _balance,
    payments: _payments,
    expenses: _expenses,
    totalExpenses: _totalExpenses,
    netProfit: _netProfit,
    shoppingLists: _shoppingLists,
    ...rest
  } = event;
  return rest;
}

@UseGuards(RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  create(@Body() dto: CreateEventDto, @CurrentUser() user: AuthPayload) {
    return this.events.create(dto, user.sub);
  }

  // No @Roles(): reachable by workers too, so chefs can pick which wedding
  // their shopping list is for. Returns no financial data.
  @Get('upcoming')
  upcoming() {
    return this.events.upcomingForPicker();
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'ZAVZAL')
  @Get()
  async findAll(
    @Query() query: FindEventsQuery,
    @CurrentUser() user: AuthPayload,
  ) {
    const events = await this.events.findAll(query);
    return user.role === 'ZAVZAL' ? events.map(hideFinancials) : events;
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'ZAVZAL')
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthPayload) {
    const event = await this.events.findOne(id);
    return user.role === 'ZAVZAL' ? hideFinancials(event) : event;
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateEventDto) {
    return this.events.update(id, dto);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() dto: UpdateEventStatusDto) {
    return this.events.updateStatus(id, dto.status);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.events.remove(id);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'ZAVZAL')
  @Post(':id/assignments')
  async assignWorker(
    @Param('id') id: string,
    @Body() dto: AssignWorkerDto,
    @CurrentUser() user: AuthPayload,
  ) {
    const event = await this.events.assignWorker(id, dto, user.sub);
    return user.role === 'ZAVZAL' ? hideFinancials(event) : event;
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'ZAVZAL')
  @Delete(':id/assignments/:workerId')
  async unassignWorker(
    @Param('id') id: string,
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthPayload,
  ) {
    const event = await this.events.unassignWorker(id, workerId);
    return user.role === 'ZAVZAL' ? hideFinancials(event) : event;
  }
}
