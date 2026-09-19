import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { WarehouseController } from './warehouse.controller';
import { WarehouseService } from './warehouse.service';

describe('WarehouseController', () => {
  let controller: WarehouseController;
  let warehouseService: Record<string, jest.Mock>;

  beforeEach(async () => {
    warehouseService = {
      getWarehouse: jest.fn(),
      createWarehouse: jest.fn(),
      requestWarehouse: jest.fn(),
      updateRequestStatus: jest.fn(),
      getWarehouseStock: jest.fn(),
      handleStockUpdated: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [WarehouseController],
      providers: [
        { provide: WarehouseService, useValue: warehouseService },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue('test-secret') } },
      ],
    }).compile();

    controller = module.get<WarehouseController>(WarehouseController);
  });

  it('creates a warehouse tagged with the requesting admin', async () => {
    warehouseService.createWarehouse.mockResolvedValue({ message: 'ok' });

    await controller.createWarehouse(
      { name: 'DC', location: 'Chennai', capacity: 100 },
      { user: { id: 'admin-1' } },
    );

    expect(warehouseService.createWarehouse).toHaveBeenCalledWith({
      name: 'DC',
      location: 'Chennai',
      capacity: 100,
      admin: 'admin-1',
    });
  });

  it('forwards supplier capacity requests with the requesting supplier id', async () => {
    warehouseService.requestWarehouse.mockResolvedValue({ message: 'ok' });

    await controller.requestWarehouse('warehouse-1', { requestCapacity: 20 }, { user: { id: 'supplier-1' } });

    expect(warehouseService.requestWarehouse).toHaveBeenCalledWith('warehouse-1', 'supplier-1', {
      requestCapacity: 20,
    });
  });

  it('forwards approve/reject decisions to the service', async () => {
    warehouseService.updateRequestStatus.mockResolvedValue({ message: 'ok' });

    await controller.updateRequestStatus('warehouse-1', 'request-1', { status: 'APPROVED' as any });

    expect(warehouseService.updateRequestStatus).toHaveBeenCalledWith('warehouse-1', 'request-1', 'APPROVED');
  });

  it('handles stock-updated events without throwing even if the service rejects', async () => {
    warehouseService.handleStockUpdated.mockRejectedValue(new Error('boom'));

    await expect(
      controller.handleStockUpdated({ supplierId: 's1', sku: 'SKU-1', productName: 'Widget', quantity: 1 }),
    ).resolves.toBeUndefined();
  });
});
