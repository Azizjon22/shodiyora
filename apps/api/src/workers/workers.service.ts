import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterWorkerDto } from './dto/register-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { FindWorkersQuery } from './dto/find-workers.query';

@Injectable()
export class WorkersService {
  constructor(private prisma: PrismaService) {}

  async register(dto: RegisterWorkerDto) {
    const existing = await this.prisma.worker.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException(
        "Bu telefon raqami bilan ishchi allaqachon ro'yxatdan o'tgan",
      );
    }

    const pinHash = dto.pin ? await bcrypt.hash(dto.pin, 10) : null;

    const worker = await this.prisma.worker.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        position: dto.position,
        photoUrl: dto.photoUrl,
        pinHash,
      },
    });

    return this.toSafe(worker);
  }

  async createByStaff(dto: RegisterWorkerDto, approvedById: string) {
    const existing = await this.prisma.worker.findUnique({
      where: { phone: dto.phone },
    });
    if (existing) {
      throw new ConflictException(
        "Bu telefon raqami bilan ishchi allaqachon ro'yxatdan o'tgan",
      );
    }

    const pinHash = dto.pin ? await bcrypt.hash(dto.pin, 10) : null;

    const worker = await this.prisma.worker.create({
      data: {
        fullName: dto.fullName,
        phone: dto.phone,
        position: dto.position,
        photoUrl: dto.photoUrl,
        pinHash,
        status: 'APPROVED',
        approvedById,
      },
    });

    return this.toSafe(worker);
  }

  async findAll(query: FindWorkersQuery) {
    const workers = await this.prisma.worker.findMany({
      where: {
        status: query.status,
        position: query.position,
      },
      orderBy: { createdAt: 'desc' },
    });
    return workers.map((w) => this.toSafe(w));
  }

  async findOne(id: string) {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException('Ishchi topilmadi');
    return this.toSafe(worker);
  }

  async approve(id: string, approvedById: string) {
    await this.ensureExists(id);
    const worker = await this.prisma.worker.update({
      where: { id },
      data: { status: 'APPROVED', approvedById },
    });
    return this.toSafe(worker);
  }

  async reject(id: string, approvedById: string) {
    await this.ensureExists(id);
    const worker = await this.prisma.worker.update({
      where: { id },
      data: { status: 'REJECTED', approvedById },
    });
    return this.toSafe(worker);
  }

  async update(id: string, dto: UpdateWorkerDto) {
    await this.ensureExists(id);
    const worker = await this.prisma.worker.update({
      where: { id },
      data: dto,
    });
    return this.toSafe(worker);
  }

  async remove(id: string) {
    await this.ensureExists(id);
    await this.prisma.worker.delete({ where: { id } });
    return { success: true };
  }

  private async ensureExists(id: string) {
    const worker = await this.prisma.worker.findUnique({ where: { id } });
    if (!worker) throw new NotFoundException('Ishchi topilmadi');
    return worker;
  }

  private toSafe<T extends { pinHash: string | null }>(worker: T) {
    const { pinHash, ...safe } = worker;
    return { ...safe, hasPin: Boolean(pinHash) };
  }
}
