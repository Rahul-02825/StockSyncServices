import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { SuppliersService } from './suppliers.service';
import { Supplier } from './entities/supplier.entity';
import { Product } from './entities/product.entity';

describe('SuppliersService', () => {
  let service: SuppliersService;
  let supplierModel: any;
  let productModel: any;
  let userServiceClient: { emit: jest.Mock };
  let warehouseServiceClient: { emit: jest.Mock };

  beforeEach(async () => {
    supplierModel = Object.assign(
      jest.fn().mockImplementation((dto) => ({
        ...dto,
        _id: 'supplier-profile-1',
        save: jest.fn().mockResolvedValue(undefined),
      })),
      { findOne: jest.fn() },
    );

    productModel = Object.assign(
      jest.fn().mockImplementation((dto) => ({
        ...dto,
        _id: 'product-1',
        save: jest.fn().mockResolvedValue(undefined),
      })),
      { findOne: jest.fn(), find: jest.fn(), findOneAndUpdate: jest.fn() },
    );

    userServiceClient = { emit: jest.fn() };
    warehouseServiceClient = { emit: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SuppliersService,
        { provide: 'USER_SERVICE', useValue: userServiceClient },
        { provide: 'WAREHOUSE_SERVICE', useValue: warehouseServiceClient },
        { provide: getModelToken(Supplier.name), useValue: supplierModel },
        { provide: getModelToken(Product.name), useValue: productModel },
      ],
    }).compile();

    service = module.get<SuppliersService>(SuppliersService);
  });

  describe('createSupplierProfile', () => {
    it('creates a profile and emits supplier-create for user-service', async () => {
      supplierModel.findOne.mockResolvedValue(null);

      const userId = new Types.ObjectId().toString();
      const result = await service.createSupplierProfile(userId, { businessName: 'Acme Co' });

      expect(userServiceClient.emit).toHaveBeenCalledWith('supplier-create', {
        supplierProfileId: 'supplier-profile-1',
        userId,
      });
      expect(result.message).toBe('supplier profile created successfully');
    });

    it('rejects when a profile already exists for the user', async () => {
      supplierModel.findOne.mockResolvedValue({ _id: 'existing' });

      await expect(
        service.createSupplierProfile(new Types.ObjectId().toString(), { businessName: 'Acme Co' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('createProduct', () => {
    it('creates a product and emits stock-updated for warehouse-service', async () => {
      productModel.findOne.mockResolvedValue(null);
      const supplierId = new Types.ObjectId().toString();

      await service.createProduct(supplierId, { sku: 'SKU-1', name: 'Widget', unitPrice: 9.99, quantity: 100 });

      expect(warehouseServiceClient.emit).toHaveBeenCalledWith('stock-updated', {
        supplierId,
        sku: 'SKU-1',
        productName: 'Widget',
        quantity: 100,
      });
    });

    it('rejects a duplicate SKU for the same supplier', async () => {
      productModel.findOne.mockResolvedValue({ sku: 'SKU-1' });

      await expect(
        service.createProduct(new Types.ObjectId().toString(), {
          sku: 'SKU-1',
          name: 'Widget',
          unitPrice: 9.99,
          quantity: 100,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('updateProductQuantity', () => {
    it('updates quantity and re-emits stock-updated', async () => {
      productModel.findOneAndUpdate.mockResolvedValue({
        _id: 'product-1',
        supplierId: 'supplier-1',
        sku: 'SKU-1',
        name: 'Widget',
        quantity: 5,
      });

      const result = await service.updateProductQuantity('supplier-1', 'product-1', 5);

      expect(warehouseServiceClient.emit).toHaveBeenCalledWith('stock-updated', {
        supplierId: 'supplier-1',
        sku: 'SKU-1',
        productName: 'Widget',
        quantity: 5,
      });
      expect(result.message).toBe('product quantity updated successfully');
    });

    it('throws when the product does not belong to this supplier', async () => {
      productModel.findOneAndUpdate.mockResolvedValue(null);

      await expect(service.updateProductQuantity('supplier-1', 'product-1', 5)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('getSupplierProfile', () => {
    it('throws when no profile exists yet', async () => {
      supplierModel.findOne.mockResolvedValue(null);

      await expect(service.getSupplierProfile('user-1')).rejects.toThrow(NotFoundException);
    });
  });
});
