import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
  Req,
  UsePipes,
  ValidationPipe,
  Put,
} from '@nestjs/common';
import { WarehouseService } from './warehouse.service';
import { CreateWarehouseDto, RequestWarehouseDto, StockUpdatedEventDto, UpdateRequestStatusDto } from './dto/data.dto';
import { EventPattern, Payload } from '@nestjs/microservices';
import { JwtAuthGaurd } from 'src/common/gaurds/jwt-auth.guard';
import { RolesGaurd } from 'src/common/gaurds/roles.guard';
import { Roles } from 'src/common/decorator/roles.decorator';

@Controller('warehouse')
export class WarehouseController {
  constructor(private readonly warehouseService: WarehouseService) {}

  @Get('/get')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('WAREHOUSE_MANAGER')
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
    return this.warehouseService.createWarehouse({
      ...createWarehouseDto,
      admin: userId,
    });
  }

  @Put('/request/:warehouseId')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('SUPPLIER')
  @UsePipes(new ValidationPipe())
  async requestWarehouse(
    @Param('warehouseId') warehouseId: string,
    @Body() requestWarehouseDto: RequestWarehouseDto,
    @Req() req,
  ) {
    const supplierId = req.user.id;
    return this.warehouseService.requestWarehouse(warehouseId, supplierId, requestWarehouseDto);
  }

  @Put('/:warehouseId/requests/:requestId')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('WAREHOUSE_MANAGER')
  @UsePipes(new ValidationPipe())
  async updateRequestStatus(
    @Param('warehouseId') warehouseId: string,
    @Param('requestId') requestId: string,
    @Body() updateRequestStatusDto: UpdateRequestStatusDto,
  ) {
    return this.warehouseService.updateRequestStatus(
      warehouseId,
      requestId,
      updateRequestStatusDto.status,
    );
  }

  @Get('/:warehouseId/stock')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('WAREHOUSE_MANAGER')
  async getWarehouseStock(@Param('warehouseId') warehouseId: string) {
    return this.warehouseService.getWarehouseStock(warehouseId);
  }

  @EventPattern('stock-updated')
  async handleStockUpdated(@Payload() event: StockUpdatedEventDto) {
    try {
      await this.warehouseService.handleStockUpdated(event);
    } catch (err) {
      console.log('error handling stock-updated event', err);
    }
  }
}
