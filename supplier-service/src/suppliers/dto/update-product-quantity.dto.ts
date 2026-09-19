import { IsNotEmpty, IsNumber, Min } from 'class-validator';

export class UpdateProductQuantityDto {
  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
