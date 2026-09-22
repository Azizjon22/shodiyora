import { WorkerPosition } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  MinLength,
} from 'class-validator';

export class UpdateWorkerDto {
  @IsOptional()
  @IsString()
  @MinLength(3)
  fullName?: string;

  @IsOptional()
  @IsEnum(WorkerPosition)
  position?: WorkerPosition;

  @IsOptional()
  @IsUrl()
  photoUrl?: string;
}
