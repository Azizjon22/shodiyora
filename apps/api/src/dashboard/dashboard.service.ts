import { Injectable } from '@nestjs/common';
import { Prisma, StaffRole } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function endOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async overview(role: StaffRole) {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    const [tomorrowEvents, upcomingEvents, pendingWorkers, approvedWorkers] =
      await Promise.all([
        this.prisma.event.findMany({
          where: {
            eventDate: { gte: startOfDay(tomorrow), lte: endOfDay(tomorrow) },
            status: { not: 'CANCELLED' },
          },
          include: {
            menu: { select: { name: true } },
            assignments: {
              include: {
                worker: {
                  select: {
                    id: true,
                    fullName: true,
                    position: true,
                    photoUrl: true,
                  },
                },
              },
            },
          },
          orderBy: { eventDate: 'asc' },
        }),
        this.prisma.event.findMany({
          where: {
            eventDate: { gte: startOfDay(now), lte: endOfDay(in7Days) },
            status: { not: 'CANCELLED' },
          },
          include: { menu: { select: { name: true } } },
          orderBy: { eventDate: 'asc' },
        }),
        this.prisma.worker.count({ where: { status: 'PENDING' } }),
        this.prisma.worker.count({ where: { status: 'APPROVED' } }),
      ]);

    const base = {
      tomorrowEvents: tomorrowEvents.map((e) => ({
        id: e.id,
        clientName: e.clientName,
        eventDate: e.eventDate,
        guestCount: e.guestCount,
        tableCapacity: e.tableCapacity,
        menuName: e.menu.name,
        assignedWorkers: e.assignments.map((a) => a.worker),
      })),
      upcomingEventsCount: upcomingEvents.length,
      workers: { pending: pendingWorkers, approved: approvedWorkers },
    };

    if (role === 'ZAVZAL') {
      return base;
    }

    const [lowStockItems, pendingShoppingLists, monthEvents] =
      await Promise.all([
        this.prisma.inventoryItem.findMany({
          where: { minThreshold: { not: null } },
        }),
        this.prisma.shoppingList.count({ where: { status: 'SUBMITTED' } }),
        this.prisma.event.findMany({
          where: {
            eventDate: {
              gte: new Date(now.getFullYear(), now.getMonth(), 1),
              lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
            },
            status: { not: 'CANCELLED' },
          },
          include: { payments: true, expenses: true },
        }),
      ]);

    const lowStock = lowStockItems.filter(
      (item) =>
        item.minThreshold && item.quantity.lessThanOrEqualTo(item.minThreshold),
    );

    const totalExpected = monthEvents.reduce(
      (sum, e) => sum.add(e.totalPrice),
      new Prisma.Decimal(0),
    );
    const totalCollected = monthEvents.reduce(
      (sum, e) =>
        sum.add(
          e.payments.reduce((s, p) => s.add(p.amount), new Prisma.Decimal(0)),
        ),
      new Prisma.Decimal(0),
    );
    const totalExpenses = monthEvents.reduce(
      (sum, e) =>
        sum.add(
          e.expenses.reduce((s, x) => s.add(x.amount), new Prisma.Decimal(0)),
        ),
      new Prisma.Decimal(0),
    );

    return {
      ...base,
      lowStockItems: lowStock,
      pendingShoppingLists,
      monthlyFinancials: {
        eventCount: monthEvents.length,
        totalExpected,
        totalCollected,
        totalOutstanding: totalExpected.sub(totalCollected),
        totalExpenses,
        netProfit: totalCollected.sub(totalExpenses),
      },
    };
  }
}
