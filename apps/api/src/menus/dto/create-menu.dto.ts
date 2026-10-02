import { Type } from 'class-transformer';
import { MenuPackageType } from '@prisma/client';
import { IsMediaUrl } from '../../common/validators/is-media-url';
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateMenuDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  price!: number;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  guestCount!: number;

  @IsEnum(MenuPackageType)
  packageType!: MenuPackageType;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsMediaUrl()
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isVip?: boolean;
}
