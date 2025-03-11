import { IsNotEmpty, IsString, IsNumber, IsArray, IsMongoId, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { Types } from 'mongoose';

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

  // @IsString()
  // userID:string

//   @IsArray()
//   @ArrayMinSize(1) // Ensure at least one supplier is provided
//   @IsMongoId({ each: true }) // Ensure each element is a valid MongoDB ObjectId
//   suppliers: Types.ObjectId[];
}