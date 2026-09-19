import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { rolesEnum } from './dto/user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: { register: jest.Mock; login: jest.Mock };

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('delegates register to AuthService', async () => {
    authService.register.mockResolvedValue({ message: 'user registered successfully' });

    const dto = { name: 'Jane', email: 'jane@example.com', password: 'password123', role: rolesEnum.CUSTOMER };
    const result = await controller.register(dto);

    expect(authService.register).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ message: 'user registered successfully' });
  });

  it('delegates login to AuthService', async () => {
    authService.login.mockResolvedValue({ accessToken: 'token' });

    const dto = { email: 'jane@example.com', password: 'password123' };
    const result = await controller.login(dto);

    expect(authService.login).toHaveBeenCalledWith(dto);
    expect(result).toEqual({ accessToken: 'token' });
  });
});
