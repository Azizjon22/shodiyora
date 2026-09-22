import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInventoryItemDto } from './dto/create-inventory-item.dto';
import { UpdateInventoryItemDto } from './dto/update-inventory-item.dto';
import { CreateTransactionDto } from './dto/create-transaction.dto';

@Injectable()
export class InventoryService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.inventoryItem.findMany({ orderBy: { name: 'asc' } });
  }

  async findOne(id: string) {
    const item = await this.prisma.inventoryItem.findUnique({ where: { id } });
    if (!item) throw new NotFoundException('Ombor mahsuloti topilmadi');
    return item;
  }

  async create(dto: CreateInventoryItemDto) {
    const existing = await this.prisma.inventoryItem.findUnique({
      where: { name: dto.name },
    });
    if (existing)
      throw new ConflictException('Bu nomdagi mahsulot allaqachon mavjud');
    return this.prisma.inventoryItem.create({
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

  async update(id: string, dto: UpdateInventoryItemDto) {
    await this.findOne(id);
    return this.prisma.inventoryItem.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    await this.prisma.inventoryItem.delete({ where: { id } });
    return { success: true };
  }

  async addTransaction(
    itemId: string,
    dto: CreateTransactionDto,
    createdById: string,
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
          createdById,
        },
      }),
    ]);
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
