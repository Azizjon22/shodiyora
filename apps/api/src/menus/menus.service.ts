import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { CreateMenuDishDto } from './dto/create-menu-dish.dto';
import { CreateMenuMediaDto } from './dto/create-menu-media.dto';

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

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

  create(dto: CreateMenuDto) {
    return this.prisma.menu.create({ data: dto });
  }

  async update(id: string, dto: UpdateMenuDto) {
    await this.ensureExists(id);
    return this.prisma.menu.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.menu.delete({ where: { id } });
    return { success: true };
  }

  async addDish(menuId: string, dto: CreateMenuDishDto) {
    await this.ensureExists(menuId);
    return this.prisma.menuDish.create({ data: { ...dto, menuId } });
  }

  async removeDish(menuId: string, dishId: string) {
    await this.ensureExists(menuId);
    await this.prisma.menuDish.delete({ where: { id: dishId } });
    return { success: true };
  }

  async addMedia(menuId: string, dto: CreateMenuMediaDto) {
    await this.ensureExists(menuId);
    return this.prisma.menuMedia.create({ data: { ...dto, menuId } });
  }

  async removeMedia(menuId: string, mediaId: string) {
    await this.ensureExists(menuId);
    await this.prisma.menuMedia.delete({ where: { id: mediaId } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) throw new NotFoundException('Menyu topilmadi');
    return menu;
  }
}
