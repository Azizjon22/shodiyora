import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ShoppingListStatus } from '@prisma/client';
import { Roles } from '../common/decorators/roles.decorator';
import { RolesGuard } from '../common/guards/roles.guard';
import { WorkerGuard } from '../common/guards/worker.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthPayload } from '../common/types/auth-payload';
import { ShoppingListsService } from './shopping-lists.service';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { MarkPurchasedDto } from './dto/mark-purchased.dto';
import { UpdateShoppingListStatusDto } from './dto/update-status.dto';

@Controller('shopping-lists')
export class ShoppingListsController {
  constructor(private lists: ShoppingListsService) {}

  @UseGuards(WorkerGuard)
  @Post()
  create(@Body() dto: CreateShoppingListDto, @CurrentUser() user: AuthPayload) {
    return this.lists.create(dto, user.sub);
  }

  @UseGuards(WorkerGuard)
  @Get('mine')
  findMine(@CurrentUser() user: AuthPayload) {
    return this.lists.findMineForWorker(user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get()
  findAll(@Query('status') status?: ShoppingListStatus) {
    return this.lists.findAll(status);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch('mark-all-seen')
  markAllSeen(@CurrentUser() user: AuthPayload) {
    return this.lists.markAllSeen(user.sub);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Get('expense-report')
  expenseReport(@Query('from') from?: string, @Query('to') to?: string) {
    return this.lists.expenseReport(
      from ? new Date(from) : undefined,
      to ? new Date(to) : undefined,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @CurrentUser() user: AuthPayload) {
    if (user.kind === 'WORKER') {
      return this.lists.ensureWorkerOwnsOrThrow(id, user.sub);
    }
    if (user.role !== 'SUPER_ADMIN' && user.role !== 'ADMIN') {
      throw new ForbiddenException("Bu amal uchun ruxsatingiz yo'q");
    }
    return this.lists.findOne(id);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateShoppingListStatusDto,
    @CurrentUser() user: AuthPayload,
  ) {
    return this.lists.updateStatus(id, dto.status, user.sub, user.fullName);
  }

  @UseGuards(RolesGuard)
  @Roles('SUPER_ADMIN', 'ADMIN')
  @Patch(':id/items/:itemId/purchase')
  markPurchased(
    @Param('id') id: string,
    @Param('itemId') itemId: string,
    @Body() dto: MarkPurchasedDto,
    @CurrentUser() user: AuthPayload,
  ) {
    return this.lists.markItemPurchased(id, itemId, dto, user.sub, user.fullName);
  }
}
