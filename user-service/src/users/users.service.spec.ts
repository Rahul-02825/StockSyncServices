import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { NotFoundException } from '@nestjs/common';
import { Types } from 'mongoose';
import { UsersService } from './users.service';
import { User } from 'src/auth/schemas.ts/user.schema';

describe('UsersService', () => {
  let service: UsersService;
  let userModel: { findById: jest.Mock; findByIdAndUpdate: jest.Mock };

  beforeEach(async () => {
    userModel = {
      findById: jest.fn(),
      findByIdAndUpdate: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getModelToken(User.name), useValue: userModel }],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  describe('handleWarehouseCreated', () => {
    it('links the warehouse id onto the admin user', async () => {
      userModel.findById.mockResolvedValue({ _id: 'user-1' });
      userModel.findByIdAndUpdate.mockResolvedValue({ _id: 'user-1' });

      const warehouseId = new Types.ObjectId().toString();
      await service.handleWarehouseCreated({ userId: 'user-1', warehouseId });

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-1',
        { $addToSet: { warehouses: new Types.ObjectId(warehouseId) } },
        { new: true },
      );
    });

    it('throws when the target user does not exist', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(
        service.handleWarehouseCreated({ userId: 'missing-user', warehouseId: new Types.ObjectId().toString() }),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('handleSupplierCreated', () => {
    it('links the supplier profile id onto the user', async () => {
      userModel.findById.mockResolvedValue({ _id: 'user-1' });
      userModel.findByIdAndUpdate.mockResolvedValue({ _id: 'user-1' });

      const supplierProfileId = new Types.ObjectId().toString();
      await service.handleSupplierCreated({ userId: 'user-1', supplierProfileId });

      expect(userModel.findByIdAndUpdate).toHaveBeenCalledWith(
        'user-1',
        { $set: { supplierProfile: new Types.ObjectId(supplierProfileId) } },
        { new: true },
      );
    });

    it('throws when the target user does not exist', async () => {
      userModel.findById.mockResolvedValue(null);

      await expect(
        service.handleSupplierCreated({ userId: 'missing-user', supplierProfileId: new Types.ObjectId().toString() }),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
