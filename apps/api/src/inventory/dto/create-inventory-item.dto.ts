import { InventoryCategory, ProductCategory, Unit } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsMediaUrl } from '../../common/validators/is-media-url';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

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
  @IsMediaUrl()
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
