import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';

@Injectable()
export class StaffUsersService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.staffUser.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateStaffUserDto) {
    const existing = await this.prisma.staffUser.findUnique({
      where: { phone: dto.phone },
    });
    if (existing)
      throw new ConflictException(
        'Bu telefon raqami bilan hisob allaqachon mavjud',
      );

    const passwordHash = await bcrypt.hash(dto.password, 10);
    const staff = await this.prisma.staffUser.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        passwordHash,
        role: dto.role,
      },
    });
    const { passwordHash: _omit, ...safe } = staff;
    return safe;
  }

  async update(id: string, dto: UpdateStaffUserDto) {
    const existing = await this.ensureExists(id);
    const demotingOrDeactivatingSuperAdmin =
      existing.role === 'SUPER_ADMIN' &&
      ((dto.role && dto.role !== 'SUPER_ADMIN') || dto.isActive === false);
    if (
      demotingOrDeactivatingSuperAdmin &&
      (await this.isLastActiveSuperAdmin(id))
    ) {
      throw new BadRequestException(
        'Tizimda kamida bitta faol super_admin qolishi shart',
      );
    }

    const passwordHash = dto.password
      ? await bcrypt.hash(dto.password, 10)
      : undefined;
    const staff = await this.prisma.staffUser.update({
      where: { id },
      data: {
        fullName: dto.fullName,
        role: dto.role,
        isActive: dto.isActive,
        passwordHash,
      },
    });
    const { passwordHash: _omit, ...safe } = staff;
    return safe;
  }

  async remove(id: string) {
    const existing = await this.ensureExists(id);
    if (
      existing.role === 'SUPER_ADMIN' &&
      (await this.isLastActiveSuperAdmin(id))
    ) {
      throw new BadRequestException(
        'Tizimda kamida bitta faol super_admin qolishi shart',
      );
    }
    await this.prisma.staffUser.delete({ where: { id } });
    return { success: true };
  }

  private async isLastActiveSuperAdmin(excludingId: string) {
    const count = await this.prisma.staffUser.count({
      where: { role: 'SUPER_ADMIN', isActive: true, id: { not: excludingId } },
    });
    return count === 0;
  }

  private async ensureExists(id: string) {
    const staff = await this.prisma.staffUser.findUnique({ where: { id } });
    if (!staff) throw new NotFoundException('Hisob topilmadi');
    return staff;
  }
}
