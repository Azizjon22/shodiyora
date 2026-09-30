import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  Min,
  MinLength,
} from 'class-validator';
import { IsUrlOrPath } from '../../common/validators/is-url-or-path.validator';

export class CreateMenuDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @Type(() => Number)
  @IsNumber()
  @Min(0)
  pricePerPerson!: number;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsUrlOrPath()
  coverImageUrl?: string;

  @IsOptional()
  @IsBoolean()
  isVip?: boolean;
}
