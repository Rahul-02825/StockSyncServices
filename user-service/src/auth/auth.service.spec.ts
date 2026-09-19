import { Test, TestingModule } from '@nestjs/testing';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { User } from './schemas.ts/user.schema';
import { rolesEnum } from './dto/user.dto';

jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

describe('AuthService', () => {
  let service: AuthService;
  let userModel: any;

  beforeEach(async () => {
    userModel = Object.assign(
      jest.fn().mockImplementation((dto) => ({
        ...dto,
        save: jest.fn().mockResolvedValue(dto),
      })),
      { findOne: jest.fn() },
    );

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: userModel },
        {
          provide: ConfigService,
          useValue: {
            getOrThrow: jest.fn().mockReturnValue('test-secret'),
            get: jest.fn().mockReturnValue('1h'),
          },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('hashes the password and saves a new user', async () => {
      userModel.findOne.mockResolvedValue(null);
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

      const result = await service.register({
        name: 'Jane',
        email: 'jane@example.com',
        password: 'password123',
        role: rolesEnum.CUSTOMER,
      });

      expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);
      expect(userModel).toHaveBeenCalledWith(
        expect.objectContaining({ password: 'hashed-password' }),
      );
      expect(result).toEqual({ message: 'user registered successfully' });
    });

    it('rejects registration when the email is already taken', async () => {
      userModel.findOne.mockResolvedValue({ email: 'jane@example.com' });

      await expect(
        service.register({
          name: 'Jane',
          email: 'jane@example.com',
          password: 'password123',
          role: rolesEnum.CUSTOMER,
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('login', () => {
    it('returns an access token for valid credentials', async () => {
      userModel.findOne.mockResolvedValue({
        _id: 'user-1',
        email: 'jane@example.com',
        role: rolesEnum.CUSTOMER,
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('signed-token');

      const result = await service.login({
        email: 'jane@example.com',
        password: 'password123',
      });

      expect(result).toEqual({ accessToken: 'signed-token' });
    });

    it('rejects login when the user does not exist', async () => {
      userModel.findOne.mockResolvedValue(null);

      await expect(
        service.login({ email: 'missing@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('rejects login when the password is incorrect', async () => {
      userModel.findOne.mockResolvedValue({
        _id: 'user-1',
        email: 'jane@example.com',
        role: rolesEnum.CUSTOMER,
        password: 'hashed-password',
      });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(
        service.login({ email: 'jane@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
