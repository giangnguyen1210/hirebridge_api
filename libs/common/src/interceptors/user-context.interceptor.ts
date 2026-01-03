import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';

/**
 * Interceptor to automatically populate createdBy and updatedBy fields
 * based on authenticated user context.
 * 
 * Usage:
 * - Can be used globally in main.ts: app.useGlobalInterceptors(new UserContextInterceptor())
 * - Can be used at controller level: @UseInterceptors(UserContextInterceptor)
 * - Can be used at method level: @UseInterceptors(UserContextInterceptor)
 * 
 * Behavior:
 * - POST requests: adds createdBy = user.id
 * - PATCH/PUT requests: adds updatedBy = user.id
 * - Only works when req.user exists (authenticated requests)
 */
@Injectable()
export class UserContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const userId = request.headers['x-user-id'];
    const userEmail = request.headers['x-user-email'];
    const method = request.method;
    const url = request.url;

    console.log(`🔍 [UserContextInterceptor] ${method} ${url}`);
    console.log(`� [UserContextInterceptor] Headers:`, { userId, userEmail });
    console.log(`👤 [UserContextInterceptor] User:`, userId ? `ID=${userId}, Email=${userEmail}` : 'No user context');

    // Only process if user context exists (authenticated request)
    if (userId) {
      const body = request.body;
      console.log(`📦 [UserContextInterceptor] Original Body:`, JSON.stringify(body));

      // For POST requests, add createdBy
      if (method === 'POST' && body) {
        this.addFieldToBody(body, 'createdBy', userId);
        console.log(`✅ [UserContextInterceptor] Added createdBy=${userId}`);
      }

      // For PATCH/PUT requests, add updatedBy
      if ((method === 'PATCH' || method === 'PUT') && body) {
        this.addFieldToBody(body, 'updatedBy', userId);
        console.log(`✅ [UserContextInterceptor] Added updatedBy=${userId}`);
      }

      console.log(`📦 [UserContextInterceptor] Modified Body:`, JSON.stringify(body));
    } else {
      console.log(`⚠️  [UserContextInterceptor] Skipping - No user context (public endpoint)`);
    }

    return next.handle();
  }

  /**
   * Safely add a field to the request body
   * Handles both simple objects and nested structures
   */
  private addFieldToBody(body: any, field: string, value: any): void {
    if (typeof body === 'object' && body !== null) {
      // Only add if the field doesn't already exist or is undefined
      if (body[field] === undefined) {
        body[field] = value;
      }
    }
  }
}
