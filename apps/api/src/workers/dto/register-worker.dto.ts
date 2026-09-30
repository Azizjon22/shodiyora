import { WorkerGender, WorkerPosition } from '@prisma/client';
import {
  IsEnum,
  IsOptional,
  IsString,
  Matches,
  MinLength,
} from 'class-validator';
import { IsUrlOrPath } from '../../common/validators/is-url-or-path.validator';

export class RegisterWorkerDto {
  @IsString()
  @MinLength(3)
  fullName!: string;

  @IsString()
  @Matches(/^\+?[0-9]{9,15}$/, { message: "Telefon raqami noto'g'ri" })
  phone!: string;

  @IsEnum(WorkerPosition)
  position!: WorkerPosition;

  @IsEnum(WorkerGender)
  gender!: WorkerGender;

  @IsOptional()
  @IsUrlOrPath()
  photoUrl?: string;

  @IsOptional()
  @Matches(/^[0-9]{4}$/, { message: "PIN 4 ta raqamdan iborat bo'lishi kerak" })
  pin?: string;
}
