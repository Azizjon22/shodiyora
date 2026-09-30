import { InventoryCategory, ProductCategory, Unit } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { IsUrlOrPath } from '../../common/validators/is-url-or-path.validator';

export class CreateInventoryItemDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsEnum(InventoryCategory)
  category?: InventoryCategory;

  @IsOptional()
  @IsEnum(ProductCategory)
  productCategory?: ProductCategory;

  @IsOptional()
  @IsUrlOrPath()
  photoUrl?: string;

  @IsEnum(Unit)
  unit!: Unit;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  quantity?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  minThreshold?: number;
}
