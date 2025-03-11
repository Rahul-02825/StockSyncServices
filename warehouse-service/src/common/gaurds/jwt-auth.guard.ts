import {
  Injectable,
  CanActivate,
  UnauthorizedException,
  ExecutionContext,
} from '@nestjs/common';
import * as jwt from 'jsonwebtoken';
import { Observable } from 'rxjs';
import {customRequest} from '../interfaces'
@Injectable()
export class JwtAuthGaurd implements CanActivate {
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: customRequest= context.switchToHttp().getRequest();

    const authorizationToken = request.headers.authorization;
    if (!authorizationToken || !authorizationToken.startsWith('Bearer'))
      throw new UnauthorizedException(
        'access denies no user exist or token expired',
      );    
      const token = authorizationToken.split(' ')[1]
      try{
        const decoded = jwt.verify(token,'SECRET_KEY')
        request.user = decoded
        return true
      }
      catch(err){
        throw new UnauthorizedException(`access denied error - ${err}`)
      }
  }
}
