import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import { Request } from 'express';
import { JWTPayloadType } from 'utilitis/types';
import { CURRNET_USER_KEY } from 'utilitis/constants';
import { UserRole } from 'utilitis/enums';

@Injectable()
export class AuthRolesGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly reflector: Reflector,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // 1. Get roles required for the handler/class
    const roles = this.reflector.getAllAndOverride<UserRole[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    // If no roles are explicitly defined on the endpoint, allow access
    if (!roles || roles.length === 0) {
      return true;
    }

    // 2. Extract Authorization Header
    const request: Request = context.switchToHttp().getRequest();
    const [type, token] = request.headers.authorization?.split(' ') ?? [];

    if (!token || type !== 'Bearer') {
      throw new UnauthorizedException('Access denied, No token provided');
    }

    try {
      // 3. Verify and decode the JWT
      const payload: any = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 4. Normalize user object ensuring 'id' and 'role' are present
      const userPayload: JWTPayloadType = {
        ...payload,
        id: payload.id || payload.sub,
        role: payload.role || payload.userType,
      };

      // 5. Check role authorization against enum values
      const hasRole = roles.includes(userPayload.role as UserRole);

      if (!hasRole) {
        throw new ForbiddenException(
          'Access denied, You do not have permission to access this resource',
        );
      }

      // 6. Attach to both request.user and custom key for decorators compatibility
      request['user'] = userPayload;
      request[CURRNET_USER_KEY] = userPayload;

      return true;
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      throw new UnauthorizedException('Access denied, Invalid or expired token');
    }
  }
}