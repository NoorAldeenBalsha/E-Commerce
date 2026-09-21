import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { ConfigService } from '@nestjs/config';
import { JWTPayloadType } from 'utilitis/types';
import { CURRNET_USER_KEY } from 'utilitis/constants';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    // 1. Extract Bearer token from Authorization header
    const authHeader = request.headers.authorization;
    const tokenFromHeader = authHeader?.startsWith('Bearer ')
      ? authHeader.split(' ')[1]
      : null;

    // 2. Extract access token strictly from cookies (NEVER fallback to refresh_token for general routes)
    const tokenFromCookie = request.cookies?.['accessToken'] || request.cookies?.['access_token'];

    const token = tokenFromHeader || tokenFromCookie;

    if (!token) {
      throw new UnauthorizedException('Access denied, No token provided');
    }

    try {
      // 3. Verify JWT signature and expiration
      const rawPayload: any = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      // 4. Normalize payload: ensure 'id' is mapped from 'sub' if needed
      const normalizedPayload: JWTPayloadType = {
        ...rawPayload,
        id: rawPayload.id || rawPayload.sub,
        role: rawPayload.role || rawPayload.userType,
      };

      // 5. Attach payload to both standard request.user and custom key
      request['user'] = normalizedPayload;
      request[CURRNET_USER_KEY] = normalizedPayload;

      return true;
    } catch (error) {
      throw new UnauthorizedException('Access denied, Invalid or expired token');
    }
  }
}