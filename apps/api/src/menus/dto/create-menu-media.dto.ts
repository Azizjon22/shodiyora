import { MediaType, MenuMediaSection } from '@prisma/client';
import { Type } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString } from 'class-validator';
import { IsUrlOrPath } from '../../common/validators/is-url-or-path.validator';

export class CreateMenuMediaDto {
  @IsEnum(MenuMediaSection)
  section!: MenuMediaSection;

  @IsEnum(MediaType)
  mediaType!: MediaType;

  @IsUrlOrPath()
  url!: string;

  @IsOptional()
  @IsString()
  caption?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  order?: number;
}
