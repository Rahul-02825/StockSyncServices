import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { JwtAuthGaurd } from './jwt-auth.guard';

jest.mock('jsonwebtoken');

describe('JwtAuthGaurd', () => {
  let guard: JwtAuthGaurd;
  let configService: { getOrThrow: jest.Mock };

  const contextFor = (headers: Record<string, string>): ExecutionContext => {
    const request: any = { headers };
    return {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
  };

  beforeEach(() => {
    configService = { getOrThrow: jest.fn().mockReturnValue('test-secret') };
    guard = new JwtAuthGaurd(configService as unknown as ConfigService);
    jest.clearAllMocks();
    configService.getOrThrow.mockReturnValue('test-secret');
  });

  it('rejects requests with no Authorization header', () => {
    expect(() => guard.canActivate(contextFor({}))).toThrow(UnauthorizedException);
  });

  it('rejects requests whose token fails verification', () => {
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('invalid token');
    });

    expect(() => guard.canActivate(contextFor({ authorization: 'Bearer bad-token' }))).toThrow(
      UnauthorizedException,
    );
  });

  it('attaches the decoded user and allows the request through on a valid token', () => {
    (jwt.verify as jest.Mock).mockReturnValue({ id: 'user-1', role: 'SUPPLIER' });
    const context = contextFor({ authorization: 'Bearer good-token' });

    const allowed = guard.canActivate(context);

    expect(allowed).toBe(true);
    expect(context.switchToHttp().getRequest().user).toEqual({ id: 'user-1', role: 'SUPPLIER' });
  });
});
