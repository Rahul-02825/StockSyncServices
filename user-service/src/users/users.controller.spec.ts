import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: { handleWarehouseCreated: jest.Mock; handleSupplierCreated: jest.Mock };

  beforeEach(async () => {
    usersService = {
      handleWarehouseCreated: jest.fn().mockResolvedValue(undefined),
      handleSupplierCreated: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [{ provide: UsersService, useValue: usersService }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
  });

  it('forwards warehouse-create events to the service', async () => {
    const event = { warehouseId: 'w1', userId: 'u1' };
    await controller.handleWarehouseCreated(event);

    expect(usersService.handleWarehouseCreated).toHaveBeenCalledWith(event);
  });

  it('forwards supplier-create events to the service', async () => {
    const event = { supplierProfileId: 's1', userId: 'u1' };
    await controller.handleSupplierCreated(event);

    expect(usersService.handleSupplierCreated).toHaveBeenCalledWith(event);
  });

  it('swallows errors from the service so a bad event does not crash the listener', async () => {
    usersService.handleWarehouseCreated.mockRejectedValue(new Error('boom'));

    await expect(
      controller.handleWarehouseCreated({ warehouseId: 'w1', userId: 'u1' }),
    ).resolves.toBeUndefined();
  });
});
