import { Injectable } from '@nestjs/common';
import { CreateWarehouseDto } from './dto/data.dto';
import {ClientProxy,ClientProxyFactory,Transport} from '@nestjs/microservices'
import { InjectModel } from '@nestjs/mongoose';
import { Warehouse, WarehouseDocument } from './entities/warehouse.entity';
import { Model } from 'mongoose';

@Injectable()
export class WarehouseService {

  constructor(@InjectModel(Warehouse.name) private warehouseModel:Model<WarehouseDocument>){}
 
  async createWarehouse(createWarehouseDto:any) {
    
    const warehouseMetaData = new this.warehouseModel(createWarehouseDto)
    warehouseMetaData.save()
    return {message:"warehouse created successfully"}
  }

}
