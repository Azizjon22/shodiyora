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

// ADMIN still needs to see which shopping lists were written for a wedding
// (they manage procurement), so only ZAVZAL loses that too — everyone
// below SUPER_ADMIN loses the money fields themselves.
function hideFinancials(
  event: Record<string, unknown>,
  keepShoppingLists: boolean,
) {
  const {
    totalPrice: _totalPrice,
    paidAmount: _paidAmount,
    balance: _balance,
    payments: _payments,
    expenses: _expenses,
    totalExpenses: _totalExpenses,
    netProfit: _netProfit,
    shoppingLists,
    ...rest
  } = event;
  return keepShoppingLists ? { ...rest, shoppingLists } : rest;
}

@UseGuards(RolesGuard)
@Controller('events')
export class EventsController {
  constructor(private events: EventsService) {}

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Post()
  async create(@Body() dto: CreateEventDto, @CurrentUser() user: AuthPayload) {
    const event = await this.events.create(dto, user.sub, user.fullName);
    if (user.role === 'SUPER_ADMIN') return event;
    return hideFinancials(event, true);
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
    if (user.role === 'SUPER_ADMIN') return events;
    const keepShoppingLists = user.role === 'ADMIN';
    return events.map((e) => hideFinancials(e, keepShoppingLists));
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'ZAVZAL')
  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthPayload) {
    const event = await this.events.findOne(id);
    if (user.role === 'SUPER_ADMIN') return event;
    return hideFinancials(event, user.role === 'ADMIN');
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateEventDto,
    @CurrentUser() user: AuthPayload,
  ) {
    const event = await this.events.update(id, dto, user.sub, user.fullName);
    return user.role === 'SUPER_ADMIN' ? event : hideFinancials(event, true);
  }

  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/status')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateEventStatusDto,
    @CurrentUser() user: AuthPayload,
  ) {
    const event = await this.events.updateStatus(
      id,
      dto.status,
      user.sub,
      user.fullName,
    );
    return user.role === 'SUPER_ADMIN' ? event : hideFinancials(event, true);
  }

  @Roles('SUPER_ADMIN')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: AuthPayload) {
    return this.events.remove(id, user.sub, user.fullName);
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'ZAVZAL')
  @Post(':id/assignments')
  async assignWorker(
    @Param('id') id: string,
    @Body() dto: AssignWorkerDto,
    @CurrentUser() user: AuthPayload,
  ) {
    const event = await this.events.assignWorker(
      id,
      dto,
      user.sub,
      user.fullName,
    );
    if (user.role === 'SUPER_ADMIN') return event;
    return hideFinancials(event, user.role === 'ADMIN');
  }

  @Roles('SUPER_ADMIN', 'ADMIN', 'ZAVZAL')
  @Delete(':id/assignments/:workerId')
  async unassignWorker(
    @Param('id') id: string,
    @Param('workerId') workerId: string,
    @CurrentUser() user: AuthPayload,
  ) {
    const event = await this.events.unassignWorker(
      id,
      workerId,
      user.sub,
      user.fullName,
    );
    if (user.role === 'SUPER_ADMIN') return event;
    return hideFinancials(event, user.role === 'ADMIN');
  }
}
