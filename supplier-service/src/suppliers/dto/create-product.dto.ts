import { IsNotEmpty, IsNumber, IsPositive, IsString, Min } from 'class-validator';

export class CreateProductDto {
  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  unitPrice: number;

  @IsNotEmpty()
  @IsNumber()
  @Min(0)
  quantity: number;
}
