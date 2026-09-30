import {
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateIf,
} from 'class-validator';
import { IsUrlOrPath } from '../../common/validators/is-url-or-path.validator';

export class UpdateBrandDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  brandName?: string;

  /** null resets to the default letter mark. */
  @IsOptional()
  @ValidateIf((_, v) => v !== null)
  @IsUrlOrPath()
  logoUrl?: string | null;
}
