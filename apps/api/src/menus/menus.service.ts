import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuDishDto } from './dto/create-menu-dish.dto';
import { CreateMenuMediaDto } from './dto/create-menu-media.dto';

@Injectable()
export class MenusService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  findAll() {
    return this.prisma.menu.findMany({
      include: {
        dishes: { orderBy: { order: 'asc' } },
        media: { orderBy: { order: 'asc' } },
      },
      orderBy: { pricePerPerson: 'asc' },
    });
  }

  async findOne(id: string) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: {
        dishes: { orderBy: { order: 'asc' } },
        media: { orderBy: { order: 'asc' } },
      },
    });
    if (!menu) throw new NotFoundException('Menyu topilmadi');
    return menu;
  }

  async create(dto: CreateMenuDto, actorId: string, actorName: string) {
    const menu = await this.prisma.menu.create({ data: dto });
    await this.auditLog.record({
      actorId,
      actorName,
      action: 'CREATE',
      entityType: 'MENU',
      entityId: menu.id,
      description: `"${menu.name}" menyusini yaratdi`,
    });
    return menu;
  }

  async update(
    id: string,
    dto: UpdateMenuDto,
    actorId: string,
    actorName: string,
  ) {
    const existing = await this.ensureExists(id);
    const menu = await this.prisma.menu.update({ where: { id }, data: dto });
    await this.auditLog.record({
      actorId,
      actorName,
      action: 'UPDATE',
      entityType: 'MENU',
      entityId: menu.id,
      description: `"${existing.name}" menyusini tahrirladi`,
    });
    return menu;
  }

  async remove(id: string, actorId: string, actorName: string) {
    const existing = await this.ensureExists(id);
    await this.prisma.menu.delete({ where: { id } });
    await this.auditLog.record({
      actorId,
      actorName,
      action: 'DELETE',
      entityType: 'MENU',
      entityId: id,
      description: `"${existing.name}" menyusini butunlay o'chirdi`,
    });
    return { success: true };
  }

  async addDish(
    menuId: string,
    dto: CreateMenuDishDto,
    actorId: string,
    actorName: string,
  ) {
    const menu = await this.ensureExists(menuId);
    const dish = await this.prisma.menuDish.create({
      data: { ...dto, menuId },
    });
    await this.auditLog.record({
      actorId,
      actorName,
      action: 'CREATE',
      entityType: 'MENU_DISH',
      entityId: dish.id,
      description: `"${menu.name}" menyusiga "${dto.name}" taomini qo'shdi`,
    });
    return dish;
  }

  async removeDish(
    menuId: string,
    dishId: string,
    actorId: string,
    actorName: string,
  ) {
    const menu = await this.ensureExists(menuId);
    const dish = await this.prisma.menuDish.findUnique({
      where: { id: dishId },
    });
    await this.prisma.menuDish.delete({ where: { id: dishId } });
    await this.auditLog.record({
      actorId,
      actorName,
      action: 'DELETE',
      entityType: 'MENU_DISH',
      entityId: dishId,
      description: `"${menu.name}" menyusidan "${dish?.name ?? 'taom'}"ni o'chirdi`,
    });
    return { success: true };
  }

  async addMedia(
    menuId: string,
    dto: CreateMenuMediaDto,
    actorId: string,
    actorName: string,
  ) {
    const menu = await this.ensureExists(menuId);
    const media = await this.prisma.menuMedia.create({
      data: { ...dto, menuId },
    });
    await this.auditLog.record({
      actorId,
      actorName,
      action: 'CREATE',
      entityType: 'MENU_MEDIA',
      entityId: media.id,
      description: `"${menu.name}" menyusiga ${dto.mediaType === 'VIDEO' ? 'video' : 'rasm'} qo'shdi`,
    });
    return media;
  }

  async removeMedia(
    menuId: string,
    mediaId: string,
    actorId: string,
    actorName: string,
  ) {
    const menu = await this.ensureExists(menuId);
    await this.prisma.menuMedia.delete({ where: { id: mediaId } });
    await this.auditLog.record({
      actorId,
      actorName,
      action: 'DELETE',
      entityType: 'MENU_MEDIA',
      entityId: mediaId,
      description: `"${menu.name}" menyusidan faylni o'chirdi`,
    });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menyu topilmadi');
    return menu;
  }
}
