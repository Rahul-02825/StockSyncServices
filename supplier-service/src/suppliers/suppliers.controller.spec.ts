import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { SuppliersController } from './suppliers.controller';
import { SuppliersService } from './suppliers.service';

describe('SuppliersController', () => {
  let controller: SuppliersController;
  let suppliersService: Record<string, jest.Mock>;

  beforeEach(async () => {
    suppliersService = {
      createSupplierProfile: jest.fn(),
      getSupplierProfile: jest.fn(),
      createProduct: jest.fn(),
      listProducts: jest.fn(),
      updateProductQuantity: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [SuppliersController],
      providers: [
        { provide: SuppliersService, useValue: suppliersService },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue('test-secret') } },
      ],
    }).compile();

    controller = module.get<SuppliersController>(SuppliersController);
  });

  it('creates a supplier profile for the requesting user', async () => {
    suppliersService.createSupplierProfile.mockResolvedValue({ message: 'ok' });

    await controller.createProfile({ businessName: 'Acme Co' }, { user: { id: 'user-1' } });

    expect(suppliersService.createSupplierProfile).toHaveBeenCalledWith('user-1', { businessName: 'Acme Co' });
  });

  it('creates a product for the requesting supplier', async () => {
    suppliersService.createProduct.mockResolvedValue({ message: 'ok' });

    await controller.createProduct(
      { sku: 'SKU-1', name: 'Widget', unitPrice: 9.99, quantity: 10 },
      { user: { id: 'user-1' } },
    );

    expect(suppliersService.createProduct).toHaveBeenCalledWith('user-1', {
      sku: 'SKU-1',
      name: 'Widget',
      unitPrice: 9.99,
      quantity: 10,
    });
  });

  it('updates a product quantity for the requesting supplier', async () => {
    suppliersService.updateProductQuantity.mockResolvedValue({ message: 'ok' });

    await controller.updateProductQuantity('product-1', { quantity: 15 }, { user: { id: 'user-1' } });

    expect(suppliersService.updateProductQuantity).toHaveBeenCalledWith('user-1', 'product-1', 15);
  });
});
