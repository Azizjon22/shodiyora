import { MenuDishCategory } from '@prisma/client';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';
import { IsUrlOrPath } from '../../common/validators/is-url-or-path.validator';

export class CreateMenuDishDto {
  @IsEnum(MenuDishCategory)
  category!: MenuDishCategory;

  @IsString()
  @MinLength(2)
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrlOrPath()
  photoUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}
