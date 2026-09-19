import {
  Controller,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { EventPattern, Payload } from '@nestjs/microservices';

export interface WarehouseCreatedEvent{
  warehouseId:string,
  userId:string
}

export interface SupplierCreatedEvent{
  supplierProfileId:string,
  userId:string
}

@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}

  @EventPattern('warehouse-create')
  async handleWarehouseCreated(@Payload() event: WarehouseCreatedEvent){
    try{
      await this.usersService.handleWarehouseCreated(event)
    }
    catch(err){
      console.log("error linking warehouse to user", err)
    }
  }

  @EventPattern('supplier-create')
  async handleSupplierCreated(@Payload() event: SupplierCreatedEvent){
    try{
      await this.usersService.handleSupplierCreated(event)
    }
    catch(err){
      console.log("error linking supplier profile to user", err)
    }
  }
}
