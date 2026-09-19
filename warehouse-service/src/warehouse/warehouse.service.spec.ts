import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import { Types } from 'mongoose';
import { WarehouseService } from './warehouse.service';
import { Warehouse } from './entities/warehouse.entity';
import { WarehouseStock } from './entities/warehouse-stock.entity';
import { RequestStatus } from './dto/data.dto';

describe('WarehouseService', () => {
  let service: WarehouseService;
  let warehouseModel: any;
  let warehouseStockModel: any;
  let userServiceClient: { emit: jest.Mock };

  beforeEach(async () => {
    warehouseModel = Object.assign(
      jest.fn().mockImplementation((dto) => ({
        ...dto,
        _id: 'warehouse-1',
        save: jest.fn().mockResolvedValue(undefined),
      })),
      {
        findById: jest.fn(),
        findByIdAndUpdate: jest.fn(),
        updateOne: jest.fn(),
        find: jest.fn(),
      },
    );

    warehouseStockModel = {
      findOneAndUpdate: jest.fn(),
      find: jest.fn(),
    };

    userServiceClient = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WarehouseService,
        { provide: 'USER_SERVICE', useValue: userServiceClient },
        { provide: getModelToken(Warehouse.name), useValue: warehouseModel },
        { provide: getModelToken(WarehouseStock.name), useValue: warehouseStockModel },
      ],
    }).compile();

    service = module.get<WarehouseService>(WarehouseService);
  });

  describe('createWarehouse', () => {
    it('saves the warehouse and emits warehouse-create for user-service', async () => {
      const result = await service.createWarehouse({
        name: 'Main DC',
        location: 'Chennai',
        capacity: 1000,
        admin: 'admin-1',
      } as any);

      expect(userServiceClient.emit).toHaveBeenCalledWith('warehouse-create', {
        warehouseId: 'warehouse-1',
        userId: 'admin-1',
      });
      expect(result.message).toBe('warehouse created successfully');
    });
  });

  describe('requestWarehouse', () => {
    it('pushes a PENDING request regardless of what the caller sends', async () => {
      warehouseModel.findById.mockResolvedValue({ _id: 'warehouse-1' });
      warehouseModel.findByIdAndUpdate.mockResolvedValue({});

      const supplierId = new Types.ObjectId().toString();
      await service.requestWarehouse('warehouse-1', supplierId, { requestCapacity: 50 });

      expect(warehouseModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'warehouse-1',
        {
          $push: {
            requests: {
              supplierId: new Types.ObjectId(supplierId),
              requestCapacity: 50,
              status: RequestStatus.PENDING,
            },
          },
        },
        { new: true },
      );
    });

    it('throws when the warehouse does not exist', async () => {
      warehouseModel.findById.mockResolvedValue(null);

      await expect(
        service.requestWarehouse('missing', new Types.ObjectId().toString(), { requestCapacity: 10 }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateRequestStatus', () => {
    it('approves a matching request', async () => {
      const requestId = new Types.ObjectId().toString();
      warehouseModel.findById.mockResolvedValue({
        requests: [{ _id: { toString: () => requestId } }],
      });
      warehouseModel.updateOne.mockResolvedValue({});

      const result = await service.updateRequestStatus('warehouse-1', requestId, RequestStatus.APPROVED);

      expect(warehouseModel.updateOne).toHaveBeenCalledWith(
        { _id: 'warehouse-1', 'requests._id': requestId },
        { $set: { 'requests.$.status': RequestStatus.APPROVED } },
      );
      expect(result.message).toContain('approved');
    });

    it('throws when the request id is not found on the warehouse', async () => {
      warehouseModel.findById.mockResolvedValue({ requests: [] });

      await expect(
        service.updateRequestStatus('warehouse-1', 'missing-request', RequestStatus.APPROVED),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleStockUpdated', () => {
    it('upserts stock only for warehouses that approved this supplier', async () => {
      const supplierId = new Types.ObjectId().toString();
      warehouseModel.find.mockResolvedValue([{ _id: 'warehouse-1' }, { _id: 'warehouse-2' }]);
      warehouseStockModel.findOneAndUpdate.mockResolvedValue({});

      const result = await service.handleStockUpdated({
        supplierId,
        sku: 'SKU-1',
        productName: 'Widget',
        quantity: 42,
      });

      expect(warehouseModel.find).toHaveBeenCalledWith({
        requests: { $elemMatch: { supplierId: new Types.ObjectId(supplierId), status: RequestStatus.APPROVED } },
      });
      expect(warehouseStockModel.findOneAndUpdate).toHaveBeenCalledTimes(2);
      expect(result).toEqual({ syncedWarehouses: 2 });
    });

    it('rejects an event with a malformed supplierId', async () => {
      await expect(
        service.handleStockUpdated({ supplierId: 'not-an-id', sku: 'SKU-1', productName: 'Widget', quantity: 1 }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('getWarehouseStock', () => {
    it('returns stock rows for the warehouse', async () => {
      warehouseStockModel.find.mockResolvedValue([{ sku: 'SKU-1', quantity: 5 }]);

      const result = await service.getWarehouseStock('warehouse-1');

      expect(warehouseStockModel.find).toHaveBeenCalledWith({ warehouseId: 'warehouse-1' });
      expect(result.data).toEqual([{ sku: 'SKU-1', quantity: 5 }]);
    });
  });
});
