import { IsEmail, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateSupplierDto {
  @IsNotEmpty()
  @IsString()
  businessName: string;

  @IsOptional()
  @IsEmail()
  contactEmail?: string;

  @IsOptional()
  @IsString()
  contactPhone?: string;

  @IsOptional()
  @IsString()
  address?: string;
}
