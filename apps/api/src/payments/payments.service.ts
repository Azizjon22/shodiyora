import { Injectable, NotFoundException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePaymentDto } from './dto/create-payment.dto';

@Injectable()
export class PaymentsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  async create(
    eventId: string,
    dto: CreatePaymentDto,
    actorId: string,
    actorName: string,
  ) {
    const event = await this.prisma.event.findUnique({
      where: { id: eventId },
    });
    if (!event) throw new NotFoundException("To'y buyurtmasi topilmadi");

    const payment = await this.prisma.payment.create({
      data: {
        eventId,
        amount: new Prisma.Decimal(dto.amount),
        method: dto.method,
        note: dto.note,
        createdById: actorId,
      },
    });

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'CREATE',
      entityType: 'PAYMENT',
      entityId: payment.id,
      description: `"${event.clientName}" to'yiga ${dto.amount.toLocaleString('uz-UZ')} so'm to'lov qo'shdi`,
    });

    return payment;
  }

  findAllForEvent(eventId: string) {
    return this.prisma.payment.findMany({
      where: { eventId },
      orderBy: { paymentDate: 'desc' },
      include: { createdBy: { select: { id: true, fullName: true } } },
    });
  }

  async remove(id: string, actorId: string, actorName: string) {
    const payment = await this.prisma.payment.findUnique({
      where: { id },
      include: { event: { select: { clientName: true } } },
    });
    if (!payment) throw new NotFoundException("To'lov topilmadi");
    await this.prisma.payment.delete({ where: { id } });

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'DELETE',
      entityType: 'PAYMENT',
      entityId: id,
      description: `"${payment.event.clientName}" to'yidan ${Number(payment.amount).toLocaleString('uz-UZ')} so'm to'lovni o'chirdi`,
    });

    return { success: true };
  }

  async summary(from?: Date, to?: Date) {
    const events = await this.prisma.event.findMany({
      where: { eventDate: { gte: from, lte: to }, status: { not: 'CANCELLED' } },
      include: { payments: true, expenses: true },
    });

    const totalExpected = events.reduce(
      (sum, e) => sum.add(e.totalPrice),
      new Prisma.Decimal(0),
    );
    const totalCollected = events.reduce(
      (sum, e) =>
        sum.add(
          e.payments.reduce((s, p) => s.add(p.amount), new Prisma.Decimal(0)),
        ),
      new Prisma.Decimal(0),
    );
    const totalExpenses = events.reduce(
      (sum, e) =>
        sum.add(
          e.expenses.reduce((s, x) => s.add(x.amount), new Prisma.Decimal(0)),
        ),
      new Prisma.Decimal(0),
    );

    return {
      eventCount: events.length,
      totalExpected,
      totalCollected,
      totalOutstanding: totalExpected.sub(totalCollected),
      totalExpenses,
      totalNetProfit: totalCollected.sub(totalExpenses),
    };
  }

  /**
   * Facts-only accounting view: only events whose day has already arrived
   * (no projected revenue from weddings still in the future), grouped by
   * the day the wedding happened, plus a category breakdown of every
   * expense. Powers the accounting dashboard's "Sof foyda" / "Xarajatlar"
   * drill-downs and month/year rollups.
   *
   * "Arrived" is compared by calendar day, not exact instant — a wedding
   * scheduled for 18:00 today must count as soon as today starts, not only
   * once 18:00 has actually passed.
   */
  async dailyReport() {
    const now = new Date();
    const endOfToday = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate(),
      23,
      59,
      59,
      999,
    );
    const events = await this.prisma.event.findMany({
      where: { eventDate: { lte: endOfToday }, status: { not: 'CANCELLED' } },
      include: { payments: true, expenses: true },
      orderBy: { eventDate: 'asc' },
    });

    const dayMap = new Map<
      string,
      {
        paid: Prisma.Decimal;
        expenses: Prisma.Decimal;
        eventCount: number;
        categories: Map<string, Prisma.Decimal>;
      }
    >();
    const categoryMap = new Map<string, Prisma.Decimal>();

    for (const event of events) {
      const day = dayKey(event.eventDate);
      const paid = event.payments.reduce(
        (s, p) => s.add(p.amount),
        new Prisma.Decimal(0),
      );
      const expenses = event.expenses.reduce(
        (s, x) => s.add(x.amount),
        new Prisma.Decimal(0),
      );

      const entry = dayMap.get(day) ?? {
        paid: new Prisma.Decimal(0),
        expenses: new Prisma.Decimal(0),
        eventCount: 0,
        categories: new Map<string, Prisma.Decimal>(),
      };
      entry.paid = entry.paid.add(paid);
      entry.expenses = entry.expenses.add(expenses);
      entry.eventCount += 1;
      dayMap.set(day, entry);

      for (const x of event.expenses) {
        entry.categories.set(
          x.category,
          (entry.categories.get(x.category) ?? new Prisma.Decimal(0)).add(
            x.amount,
          ),
        );
        categoryMap.set(
          x.category,
          (categoryMap.get(x.category) ?? new Prisma.Decimal(0)).add(
            x.amount,
          ),
        );
      }
    }

    const days = Array.from(dayMap.entries())
      .map(([date, v]) => ({
        date,
        totalPaid: v.paid,
        totalExpenses: v.expenses,
        netProfit: v.paid.sub(v.expenses),
        eventCount: v.eventCount,
        expensesByCategory: Array.from(v.categories.entries())
          .map(([category, amount]) => ({ category, amount }))
          .sort((a, b) => b.amount.comparedTo(a.amount)),
      }))
      .sort((a, b) => (a.date < b.date ? 1 : -1));

    const totalPaid = days.reduce(
      (s, d) => s.add(d.totalPaid),
      new Prisma.Decimal(0),
    );
    const totalExpensesAll = days.reduce(
      (s, d) => s.add(d.totalExpenses),
      new Prisma.Decimal(0),
    );

    const expensesByCategory = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount.comparedTo(a.amount));

    return {
      days,
      totalPaid,
      totalExpenses: totalExpensesAll,
      netProfit: totalPaid.sub(totalExpensesAll),
      expensesByCategory,
    };
  }
}

function dayKey(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}
