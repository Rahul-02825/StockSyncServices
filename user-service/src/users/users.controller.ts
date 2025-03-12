import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { JwtAuthGaurd } from 'src/common/gaurds/jwt-auth.guard';
import { RolesGaurd } from 'src/common/gaurds/roles.guard';
import { CreateWarehouseDto } from './dto/data.dto';
import { Roles } from 'src/common/decorator/roles.decorator';
import { ClientProxy, EventPattern, Payload } from '@nestjs/microservices';

export interface QueueDto{
  warehouseId:string,
  userId:string
}
@Controller()
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
  ) {}
  // handled the warehouse created event in the warehouse service
  @EventPattern('warehouse-create')
  async handleWarehouseCreated(@Payload() queueDto:QueueDto){
    try{
      await this.usersService.handleWarehouseCreated(queueDto)
      console.log("connected with warehouse service via userservice")
    }
    catch(err){
      console.log("error in connecting warehouse and userservice")
    }
    
  }
  
}
