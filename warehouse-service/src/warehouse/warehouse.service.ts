import { Inject, Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { CreateWarehouseDto, RequestStatus, RequestWarehouseDto, StockUpdatedEventDto } from './dto/data.dto';
import { ClientProxy } from '@nestjs/microservices';
import { InjectModel } from '@nestjs/mongoose';
import { Warehouse, WarehouseDocument } from './entities/warehouse.entity';
import { WarehouseStock, WarehouseStockDocument } from './entities/warehouse-stock.entity';
import { Model, Types } from 'mongoose';

@Injectable()
export class WarehouseService {
  constructor(
    @Inject('USER_SERVICE') private readonly userServiceClient: ClientProxy,
    @InjectModel(Warehouse.name) private warehouseModel: Model<WarehouseDocument>,
    @InjectModel(WarehouseStock.name) private warehouseStockModel: Model<WarehouseStockDocument>,
  ) {}

  async createWarehouse(createWarehouseDto: CreateWarehouseDto & { admin: string }) {
    const warehouseMetaData = new this.warehouseModel(createWarehouseDto);
    await warehouseMetaData.save();

    // Emit warehouse id to user-service so it can link the warehouse to its admin user
    this.userServiceClient.emit('warehouse-create', {
      warehouseId: warehouseMetaData._id,
      userId: warehouseMetaData.admin,
    });
    return { message: 'warehouse created successfully', data: warehouseMetaData };
  }

  async requestWarehouse(warehouseId: string, supplierId: string, requestWarehouseDto: RequestWarehouseDto) {
    const warehouse = await this.warehouseModel.findById(warehouseId);
    if (!warehouse) throw new NotFoundException('requested warehouse not found');

    await this.warehouseModel.findByIdAndUpdate(
      warehouseId,
      {
        $push: {
          requests: {
            supplierId: new Types.ObjectId(supplierId),
            requestCapacity: requestWarehouseDto.requestCapacity,
            status: RequestStatus.PENDING,
          },
        },
      },
      { new: true },
    );
    return { message: 'request sent successfully' };
  }

  async updateRequestStatus(warehouseId: string, requestId: string, status: RequestStatus) {
    const warehouse = await this.warehouseModel.findById(warehouseId);
    if (!warehouse) throw new NotFoundException('requested warehouse not found');

    const request = warehouse.requests.find((r) => r._id?.toString() === requestId);
    if (!request) throw new NotFoundException('request not found on this warehouse');

    await this.warehouseModel.updateOne(
      { _id: warehouseId, 'requests._id': requestId },
      { $set: { 'requests.$.status': status } },
    );
    return { message: `request ${status.toLowerCase()} successfully` };
  }

  async getWarehouse(userId: string) {
    const warehouses = await this.warehouseModel.find({ admin: userId });
    return { message: 'success retrived warehouses', data: warehouses };
  }

  // Keeps warehouse-side stock in sync whenever a supplier updates a product's
  // quantity. Only warehouses that have APPROVED this supplier's capacity
  // request receive the update.
  async handleStockUpdated(event: StockUpdatedEventDto) {
    if (!Types.ObjectId.isValid(event.supplierId)) {
      throw new BadRequestException('invalid supplierId in stock-updated event');
    }
    const supplierId = new Types.ObjectId(event.supplierId);

    const warehouses = await this.warehouseModel.find({
      requests: { $elemMatch: { supplierId, status: RequestStatus.APPROVED } },
    });

    await Promise.all(
      warehouses.map((warehouse) =>
        this.warehouseStockModel.findOneAndUpdate(
          { warehouseId: warehouse._id, supplierId, sku: event.sku },
          { $set: { productName: event.productName, quantity: event.quantity } },
          { upsert: true, new: true },
        ),
      ),
    );

    return { syncedWarehouses: warehouses.length };
  }

  async getWarehouseStock(warehouseId: string) {
    const stock = await this.warehouseStockModel.find({ warehouseId });
    return { message: 'success retrieved warehouse stock', data: stock };
  }
}
