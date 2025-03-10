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
import { ClientProxy } from '@nestjs/microservices';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    @Inject('WAREHOUSE-SERVICE') private readonly warehouseClient: ClientProxy,
  ) {}
  // post request for creating a new ware house from the userService to wareHouseService
  @Post('/createWarehouse')
  @UseGuards(JwtAuthGaurd, RolesGaurd)
  @Roles('WAREHOUSE_MANAGER')
  @UsePipes(new ValidationPipe())
  async createWarehouse(
    @Body() createWarehouseDto: CreateWarehouseDto,
    @Req() req,
  ) {
    const userId = req.user.id;
    const payload = { ...createWarehouseDto, userId: userId };

    // Ensure RabbitMQ is connected before emitting
    await this.warehouseClient.connect();

    // emmiting data to warehouse service
    this.warehouseClient.emit('warehouse-create', payload);
    
    return { message: 'create warehouse request is sent' };
  }
}
