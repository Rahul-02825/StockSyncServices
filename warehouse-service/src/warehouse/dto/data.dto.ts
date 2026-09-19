import { IsNotEmpty, IsString, IsNumber, IsEnum, IsPositive } from 'class-validator';

export class CreateWarehouseDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  location: string;

  @IsNotEmpty()
  @IsNumber()
  capacity: number;
}

export enum RequestStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

export class RequestWarehouseDto {
  @IsNotEmpty()
  @IsNumber()
  @IsPositive()
  requestCapacity: number;
}

export class UpdateRequestStatusDto {
  @IsNotEmpty()
  @IsEnum(RequestStatus, { message: 'status must be APPROVED or REJECTED' })
  status: RequestStatus;
}

export class StockUpdatedEventDto {
  @IsNotEmpty()
  @IsString()
  supplierId: string;

  @IsNotEmpty()
  @IsString()
  sku: string;

  @IsNotEmpty()
  @IsString()
  productName: string;

  @IsNotEmpty()
  @IsNumber()
  quantity: number;
}