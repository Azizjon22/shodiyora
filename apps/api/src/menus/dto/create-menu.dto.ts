import { Type } from 'class-transformer';
import { IsMediaUrl } from '../../common/validators/is-media-url';
import {
  IsBoolean,
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
  pricePerPerson!: number;

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
