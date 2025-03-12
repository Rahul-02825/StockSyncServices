import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  Inject,
  Put,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto } from './dto/data.dto';
import { EventPattern } from '@nestjs/microservices';
import { JwtAuthGaurd } from 'src/common/gaurds/jwt-auth.guard';
import { RolesGaurd } from 'src/common/gaurds/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}
  // @EventPattern('warehouse-create')

  @Get('/get')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('WAREHOUSE_MANAGER')
  @UsePipes(new ValidationPipe())
  async getWarehouse(@Req() req) {
    const userId = req.user.id;
    return this.warehouseService.getWarehouse(userId);
  }

  @Post('/create')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('WAREHOUSE_MANAGER')
  @UsePipes(new ValidationPipe())
  async createWarehouse(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const warehousePayload = {
      ...createWarehouseDto,
      admin: userId,
    };
    return this.warehouseService.createWarehouse(warehousePayload);
  }

  @Put('/request/:warehouseId')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('SUPPLIER')
  @UsePipes(new ValidationPipe())
  async requestWarehouse(
    @Param('warehouseId')
    warehouseId: string,
    @Body()
    requestWarehouseDto: {
      requestCapacity?: number;
      status?: string;
    },
    @Req() req,
  ) {
    const supplierId = req.user.id;
    const requestPayload = {
      ...requestWarehouseDto,
      supplierId,
    };
    console.log(requestPayload);
    return this.warehouseService.requestWarehouse(warehouseId, requestPayload);
  }
}
