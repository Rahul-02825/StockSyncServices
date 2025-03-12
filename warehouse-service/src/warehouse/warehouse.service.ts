import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/data.dto';
import {
  ClientProxy,
  ClientProxyFactory,
  Transport,
} from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Warehouse, WarehouseDocument } from './entities/warehouse.entity';
import { Model } from 'mongoose';

@Injectable()
export class WarehouseService {
  constructor(@Inject('WAREHOUSE-SERVICE') private readonly warehouseClient:ClientProxy,
    @InjectModel(Warehouse.name)
    private warehouseModel: Model<WarehouseDocument>,
  ) {}

  async createWarehouse(createWarehouseDto: any) {
    const warehouseMetaData = new this.warehouseModel(createWarehouseDto);
    await warehouseMetaData.save();
    console.log(warehouseMetaData._id);
    // wait for the rabbitmq connection
    await this.warehouseClient.connect()
    // Emit warehouse id  to userService to facilitate many to many relationship through rabbitmq
    this.warehouseClient.emit('warehouse-create',{
      warehouseId : warehouseMetaData._id,
      userId:warehouseMetaData.admin
    })
    return { message: 'warehouse created successfully'};
  }

  async requestWarehouse(warehouseId: any, requestWarehouseDto: any) {
    const warehouse = await this.warehouseModel.findById(warehouseId);

    if (!warehouse)
      throw new NotFoundException('requested warehouse not found');
    console.log(requestWarehouseDto);
    await this.warehouseModel.findByIdAndUpdate(
      warehouseId,
      { $push: { requests: requestWarehouseDto } },
      { new: true },
    );
    return { message: 'request sent successfully' };
  }

  async getWarehouse(userId: string) {
    const warehouses = await this.warehouseModel.find({ admin: userId });
    if (!warehouses)
      throw new NotFoundException('requested warehouse is not available');

    return { message: 'success retrived warehouses', data: warehouses };
  }
}
