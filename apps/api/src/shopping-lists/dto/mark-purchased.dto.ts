import { Type } from 'class-transformer';
import { IsNumber, Min } from 'class-validator';

export class MarkPurchasedDto {
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  unitPrice!: number;
}
