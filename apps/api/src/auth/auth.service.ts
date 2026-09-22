import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { AuthPayload } from '../common/types/auth-payload';
import { StaffLoginDto } from './dto/staff-login.dto';
import { WorkerLoginDto } from './dto/worker-login.dto';

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  private signTokens(payload: AuthPayload): TokenPair {
    const accessToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_ACCESS_SECRET'),
      expiresIn: this.config.get<string>('JWT_ACCESS_TTL', '15m'),
    });
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get<string>('JWT_REFRESH_TTL', '30d'),
    });
    return { accessToken, refreshToken };
  }

  async loginStaff(dto: StaffLoginDto) {
    const staff = await this.prisma.staffUser.findUnique({
      where: { phone: dto.phone },
    });
    if (!staff || !staff.isActive) {
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }
    const valid = await bcrypt.compare(dto.password, staff.passwordHash);
    if (!valid) {
      throw new UnauthorizedException("Login yoki parol noto'g'ri");
    }

    const payload: AuthPayload = {
      sub: staff.id,
      kind: 'STAFF',
      role: staff.role,
      fullName: staff.fullName,
    };
    const tokens = this.signTokens(payload);
    return {
      ...tokens,
      user: {
        id: staff.id,
        fullName: staff.fullName,
        phone: staff.phone,
        role: staff.role,
        kind: 'STAFF' as const,
      },
    };
  }

  async loginWorker(dto: WorkerLoginDto) {
    const worker = await this.prisma.worker.findUnique({
      where: { phone: dto.phone },
    });
    if (!worker || !worker.pinHash) {
      throw new UnauthorizedException("Login yoki PIN noto'g'ri");
    }
    if (worker.status !== 'APPROVED') {
      throw new ForbiddenException(
        "Hisobingiz hali tasdiqlanmagan. Administrator bilan bog'laning.",
      );
    }
    const valid = await bcrypt.compare(dto.pin, worker.pinHash);
    if (!valid) {
      throw new UnauthorizedException("Login yoki PIN noto'g'ri");
    }

    const payload: AuthPayload = {
      sub: worker.id,
      kind: 'WORKER',
      fullName: worker.fullName,
    };
    const tokens = this.signTokens(payload);
    return {
      ...tokens,
      user: {
        id: worker.id,
        fullName: worker.fullName,
        phone: worker.phone,
        position: worker.position,
        kind: 'WORKER' as const,
      },
    };
  }

  async refresh(refreshToken: string): Promise<TokenPair> {
    let payload: AuthPayload;
    try {
      payload = this.jwt.verify<AuthPayload>(refreshToken, {
        secret: this.config.getOrThrow<string>('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Sessiya muddati tugagan, qayta kiring');
    }

    if (payload.kind === 'STAFF') {
      const staff = await this.prisma.staffUser.findUnique({
        where: { id: payload.sub },
      });
      if (!staff || !staff.isActive) {
        throw new UnauthorizedException('Hisob faol emas');
      }
      return this.signTokens({
        sub: staff.id,
        kind: 'STAFF',
        role: staff.role,
        fullName: staff.fullName,
      });
    }

    const worker = await this.prisma.worker.findUnique({
      where: { id: payload.sub },
    });
    if (!worker || worker.status !== 'APPROVED') {
      throw new UnauthorizedException('Hisob faol emas');
    }
    return this.signTokens({
      sub: worker.id,
      kind: 'WORKER',
      fullName: worker.fullName,
    });
  }

  async me(auth: AuthPayload) {
    if (auth.kind === 'STAFF') {
      const staff = await this.prisma.staffUser.findUnique({
        where: { id: auth.sub },
      });
      if (!staff) throw new UnauthorizedException();
      return {
        id: staff.id,
        fullName: staff.fullName,
        phone: staff.phone,
        role: staff.role,
        kind: 'STAFF' as const,
      };
    }
    const worker = await this.prisma.worker.findUnique({
      where: { id: auth.sub },
    });
    if (!worker) throw new UnauthorizedException();
    return {
      id: worker.id,
      fullName: worker.fullName,
      phone: worker.phone,
      position: worker.position,
      kind: 'WORKER' as const,
    };
  }
}
