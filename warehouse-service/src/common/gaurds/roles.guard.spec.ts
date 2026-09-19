import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGaurd } from './roles.guard';

describe('RolesGaurd', () => {
  let guard: RolesGaurd;
  let reflector: { get: jest.Mock };

  const contextFor = (user: any): ExecutionContext =>
    ({
      switchToHttp: () => ({ getRequest: () => ({ user }) }),
      getHandler: () => jest.fn(),
    }) as unknown as ExecutionContext;

  beforeEach(() => {
    reflector = { get: jest.fn() };
    guard = new RolesGaurd(reflector as unknown as Reflector);
  });

  it('allows the request when the handler declares no required roles', () => {
    reflector.get.mockReturnValue(undefined);

    expect(guard.canActivate(contextFor({ role: 'SUPPLIER' }))).toBe(true);
  });

  it('rejects when the request has no user/role attached', () => {
    reflector.get.mockReturnValue(['WAREHOUSE_MANAGER']);

    expect(() => guard.canActivate(contextFor(undefined))).toThrow(ForbiddenException);
  });

  it('rejects when the user role is not in the required list', () => {
    reflector.get.mockReturnValue(['WAREHOUSE_MANAGER']);

    expect(() => guard.canActivate(contextFor({ role: 'SUPPLIER' }))).toThrow(ForbiddenException);
  });

  it('allows when the user role matches a required role', () => {
    reflector.get.mockReturnValue(['WAREHOUSE_MANAGER']);

    expect(guard.canActivate(contextFor({ role: 'WAREHOUSE_MANAGER' }))).toBe(true);
  });
});
