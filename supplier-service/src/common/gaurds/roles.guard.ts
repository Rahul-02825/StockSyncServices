import {
  ForbiddenException,
  ExecutionContext,
  Injectable,
  CanActivate,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class RolesGaurd implements CanActivate {
  constructor(private reflector: Reflector) {}
  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.get<string[]>(
      'roles',
      context.getHandler(),
    );

    if (!requiredRoles) return true;

    const { user } = context.switchToHttp().getRequest();
    if (!user || !user.role) {
      throw new ForbiddenException('Access denied: no roles assigned');
    }

    if (!requiredRoles.includes(user.role)) {
      throw new ForbiddenException('Access denied: you are not allowed to perform this operation');
    }

    return true;
  }
}
