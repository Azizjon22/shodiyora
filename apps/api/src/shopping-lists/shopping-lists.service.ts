import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma, ShoppingListStatus } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateShoppingListDto } from './dto/create-shopping-list.dto';
import { MarkPurchasedDto } from './dto/mark-purchased.dto';

const include = {
  items: true,
  createdByWorker: { select: { id: true, fullName: true, position: true } },
  event: { select: { id: true, clientName: true, eventDate: true } },
  reviewedBy: { select: { id: true, fullName: true } },
};

const STATUS_LABEL_UZ: Record<string, string> = {
  SUBMITTED: 'Yuborilgan',
  REVIEWED: "Ko'rib chiqilgan",
  PURCHASED: 'Xarid qilingan',
  CLOSED: 'Yopilgan',
};

@Injectable()
export class ShoppingListsService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  create(dto: CreateShoppingListDto, workerId: string) {
    return this.prisma.shoppingList.create({
      data: {
        eventId: dto.eventId,
        createdByWorkerId: workerId,
        items: {
          create: dto.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            unit: item.unit,
            note: item.note,
          })),
        },
      },
      include,
    });
  }

  findAll(status?: ShoppingListStatus) {
    return this.prisma.shoppingList.findMany({
      where: { status },
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  findMineForWorker(workerId: string) {
    return this.prisma.shoppingList.findMany({
      where: { createdByWorkerId: workerId },
      include,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const list = await this.prisma.shoppingList.findUnique({
      where: { id },
      include,
    });
    if (!list) throw new NotFoundException("Bozorlik ro'yxati topilmadi");
    return list;
  }

  async ensureWorkerOwnsOrThrow(id: string, workerId: string) {
    const list = await this.findOne(id);
    if (list.createdByWorkerId !== workerId) {
      throw new ForbiddenException("Bu ro'yxat sizga tegishli emas");
    }
    return list;
  }

  async updateStatus(
    id: string,
    status: ShoppingListStatus,
    actorId: string,
    actorName: string,
  ) {
    const existing = await this.findOne(id);
    const list = await this.prisma.shoppingList.update({
      where: { id },
      data: { status, reviewedById: actorId, reviewedAt: new Date() },
      include,
    });

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'STATUS_CHANGE',
      entityType: 'SHOPPING_LIST',
      entityId: id,
      description: `${existing.createdByWorker.fullName}ning bozorlik ro'yxati holatini ${STATUS_LABEL_UZ[existing.status] ?? existing.status} → ${STATUS_LABEL_UZ[status] ?? status} ga o'zgartirdi`,
    });

    return list;
  }

  /**
   * Called when an admin opens the shopping lists page — flips freshly
   * submitted lists to REVIEWED so the notification badge clears on next
   * load, without requiring any further action on the lists themselves.
   */
  async markAllSeen(reviewedById: string) {
    await this.prisma.shoppingList.updateMany({
      where: { status: 'SUBMITTED' },
      data: { status: 'REVIEWED', reviewedById, reviewedAt: new Date() },
    });
  }

  async markItemPurchased(
    listId: string,
    itemId: string,
    dto: MarkPurchasedDto,
    actorId: string,
    actorName: string,
  ) {
    const list = await this.findOne(listId);
    const item = list.items.find((i) => i.id === itemId);
    if (!item) throw new NotFoundException("Ro'yxat elementi topilmadi");

    const inventoryItem = await this.prisma.inventoryItem.upsert({
      where: { name: item.name },
      create: { name: item.name, unit: item.unit, quantity: item.quantity },
      update: { quantity: { increment: item.quantity } },
    });

    await this.prisma.$transaction([
      this.prisma.shoppingListItem.update({
        where: { id: itemId },
        data: {
          isPurchased: true,
          unitPrice: new Prisma.Decimal(dto.unitPrice),
        },
      }),
      this.prisma.inventoryTransaction.create({
        data: {
          itemId: inventoryItem.id,
          type: 'IN',
          quantity: item.quantity,
          note: `Bozorlik ro'yxatidan: ${item.name}`,
          sourceShoppingListItemId: itemId,
          createdById: actorId,
        },
      }),
    ]);

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'UPDATE',
      entityType: 'SHOPPING_LIST',
      entityId: listId,
      description: `"${item.name}" (${item.quantity} ${item.unit}) xarid qilinganini belgiladi, narxi ${dto.unitPrice.toLocaleString('uz-UZ')} so'm`,
    });

    return this.findOne(listId);
  }

  async expenseReport(from?: Date, to?: Date) {
    const items = await this.prisma.shoppingListItem.findMany({
      where: {
        isPurchased: true,
        shoppingList: {
          createdAt: { gte: from, lte: to },
        },
      },
      include: {
        shoppingList: { select: { id: true, eventId: true, createdAt: true } },
      },
    });

    const total = items.reduce(
      (sum, item) =>
        sum.add(item.unitPrice ? item.unitPrice.mul(item.quantity) : 0),
      new Prisma.Decimal(0),
    );

    return { total, items };
  }
}
