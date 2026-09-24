import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateStaffUserDto } from './dto/create-staff-user.dto';
import { UpdateStaffUserDto } from './dto/update-staff-user.dto';

const ROLE_LABEL_UZ: Record<string, string> = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Admin',
  ZAVZAL: 'Zavzal',
};

@Injectable()
export class StaffUsersService {
  constructor(
    private prisma: PrismaService,
    private auditLog: AuditLogService,
  ) {}

  findAll() {
    return this.prisma.staffUser.findMany({
      select: {
        id: true,
        fullName: true,
        phone: true,
        role: true,
        isActive: true,
        mustChangePassword: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(dto: CreateStaffUserDto, actorId: string, actorName: string) {
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
        mustChangePassword: true,
      },
    });

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'CREATE',
      entityType: 'STAFF_USER',
      entityId: staff.id,
      description: `"${staff.fullName}" (${ROLE_LABEL_UZ[staff.role] ?? staff.role}) xodimini qo'shdi`,
    });

    const { passwordHash: _omit, ...safe } = staff;
    return safe;
  }

  async update(
    id: string,
    dto: UpdateStaffUserDto,
    actorId: string,
    actorName: string,
  ) {
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
        mustChangePassword: dto.password ? true : undefined,
      },
    });

    const changes: string[] = [];
    if (dto.role && dto.role !== existing.role) {
      changes.push(
        `rol: ${ROLE_LABEL_UZ[existing.role] ?? existing.role} → ${ROLE_LABEL_UZ[dto.role] ?? dto.role}`,
      );
    }
    if (dto.isActive !== undefined && dto.isActive !== existing.isActive) {
      changes.push(dto.isActive ? 'faollashtirdi' : 'faolsizlantirdi');
    }
    if (dto.password) changes.push('parolni yangiladi');
    if (dto.fullName && dto.fullName !== existing.fullName) {
      changes.push(`ism: "${existing.fullName}" → "${dto.fullName}"`);
    }

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'UPDATE',
      entityType: 'STAFF_USER',
      entityId: id,
      description: `"${existing.fullName}" xodimini tahrirladi${changes.length ? ` (${changes.join(', ')})` : ''}`,
    });

    const { passwordHash: _omit, ...safe } = staff;
    return safe;
  }

  async remove(id: string, actorId: string, actorName: string) {
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

    await this.auditLog.record({
      actorId,
      actorName,
      action: 'DELETE',
      entityType: 'STAFF_USER',
      entityId: id,
      description: `"${existing.fullName}" xodimini butunlay o'chirdi`,
    });

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
