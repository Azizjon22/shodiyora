import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class InventoryService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  findAll() {
    return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Ombor mahsuloti topilmadi');
    return item;
  }

  async create(
    dto: CreateInventoryItemDto,
    actorId: string,
    actorName: string,
  ) {
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { name: dto.name },
    });
    if (existing)
      throw new ConflictException('Bu nomdagi mahsulot allaqachon mavjud');
    const item = await this.prisma.inventoryItem.create({
      data: {
        name: dto.name,
        category: dto.category,
        productCategory: dto.productCategory,
        photoUrl: dto.photoUrl,
        unit: dto.unit,
        quantity: dto.quantity ?? 0,
        minThreshold: dto.minThreshold,
      },
    });

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'CREATE',
      entityType: 'INVENTORY_ITEM',
      entityId: item.id,
      description: `Omborga "${item.name}" mahsulotini qo'shdi`,
    });

    return item;
  }

  /**
   * Read-only product catalog for building shopping lists — reachable by
   * chefs (WORKER kind) as well as staff, unlike the rest of this module.
   */
  productCatalog() {
    return this.prisma.inventoryItem.findMany({
      where: { category: 'PRODUCT' },
      select: {
        id: true,
        name: true,
        productCategory: true,
        unit: true,
        photoUrl: true,
      },
      orderBy: { name: 'asc' },
    });
  }

  async update(
    id: string,
    dto: UpdateInventoryItemDto,
    actorId: string,
    actorName: string,
  ) {
    const existing = await this.findOne(id);
    const item = await this.prisma.inventoryItem.update({
      where: { id },
      data: dto,
    });

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'UPDATE',
      entityType: 'INVENTORY_ITEM',
      entityId: id,
      description: `"${existing.name}" ombor mahsulotini tahrirladi`,
    });

    return item;
  }

  async remove(id: string, actorId: string, actorName: string) {
    const existing = await this.findOne(id);
    await this.prisma.inventoryItem.delete({ where: { id } });

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'DELETE',
      entityType: 'INVENTORY_ITEM',
      entityId: id,
      description: `"${existing.name}" mahsulotini ombordan butunlay o'chirdi`,
    });

    return { success: true };
  }

  async addTransaction(
    itemId: string,
    dto: CreateTransactionDto,
    actorId: string,
    actorName: string,
  ) {
    const item = await this.findOne(itemId);
    const delta = dto.type === 'IN' ? dto.quantity : -dto.quantity;
    const newQuantity = item.quantity.add(delta);
    if (newQuantity.lessThan(0)) {
      throw new BadRequestException('Ombordagi mahsulot yetarli emas');
    }

    const [, transaction] = await this.prisma.$transaction([
      this.prisma.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: newQuantity },
      }),
      this.prisma.inventoryTransaction.create({
        data: {
          itemId,
          type: dto.type,
          quantity: new Prisma.Decimal(dto.quantity),
          note: dto.note,
          createdById: actorId,
        },
      }),
    ]);

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'UPDATE',
      entityType: 'INVENTORY_ITEM',
      entityId: itemId,
      description: `"${item.name}" uchun ${dto.type === 'IN' ? 'kirim' : 'chiqim'}: ${dto.quantity} dona`,
    });

    return transaction;
  }

  listTransactions(itemId: string) {
    return this.prisma.inventoryTransaction.findMany({
      where: { itemId },
      orderBy: { createdAt: 'desc' },
      include: { createdBy: { select: { id: true, fullName: true } } },
    });
  }

  async lowStock() {
    const items = await this.prisma.inventoryItem.findMany({
      where: { minThreshold: { not: null } },
      orderBy: { name: 'asc' },
    });
    return items.filter(
      (item) =>
        item.minThreshold && item.quantity.lessThanOrEqualTo(item.minThreshold),
    );
  }
}
