import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';

@Injectable()
export class UserContextGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    // Extract user from NGINX headers and attach to request
    request.user = {
      id: request.headers['x-user-id'],
      email: request.headers['x-user-email'],
      role: request.headers['x-user-role'],
      name: request.headers['x-user-name'],
    };

    // Always return true (we trust NGINX already validated)
    return true;
  }
}