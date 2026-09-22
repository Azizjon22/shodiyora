import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventExpenseDto } from './dto/create-event-expense.dto';

@Injectable()
export class EventExpensesService {
  constructor(private prisma: PrismaService) {}

  async create(eventId: string, dto: CreateEventExpenseDto, createdById: string) {
    const event = await this.prisma.event.findUnique({ where: { id: eventId } });
    if (!event) throw new NotFoundException("To'y buyurtmasi topilmadi");

    return this.prisma.eventExpense.create({
      data: {
        eventId,
        category: dto.category,
        amount: new Prisma.Decimal(dto.amount),
        note: dto.note,
        createdById,
      },
    });
  }

  findAllForEvent(eventId: string) {
    return this.prisma.eventExpense.findMany({
      where: { eventId },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, fullName: true } } },
    });
  }

  async remove(id: string) {
    const expense = await this.prisma.eventExpense.findUnique({ where: { id } });
    if (!expense) throw new NotFoundException('Xarajat topilmadi');
    await this.prisma.eventExpense.delete({ where: { id } });
    return { success: true };
  }
}
