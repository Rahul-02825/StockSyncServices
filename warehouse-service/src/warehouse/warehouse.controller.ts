import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Req,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/data.dto';
import { EventPattern } from '@nestjs/microservices';

@Controller()
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}
  @EventPattern('warehouse-create')
  async createWarehouse(createWarehouseDto: CreateWarehouseDto) {
    console.log('Received message:', createWarehouseDto);
    const warehousePayload = {
      ...createWarehouseDto,
      supplier: [createWarehouseDto.userID],
    };
    return this.warehouseService.createWarehouse(warehousePayload);
  }
}
