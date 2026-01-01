import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { RESPONSE_MESSAGE_KEY } from '../decorators/response-message.decorator';
import { ApiResponse } from '../interfaces/api-response.interface';

@Injectable()
export class TransformInterceptor<T>
  implements NestInterceptor<T, ApiResponse<T>> {
  constructor(private reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<ApiResponse<T>> {
    const handler = context.getHandler();
    
    // 1. Get the custom message from the decorator
    const messageFromDecorator = this.reflector.get<string>(
      RESPONSE_MESSAGE_KEY,
      handler,
    );

    return next.handle().pipe(
      map((data) => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        // 2. Priority: Decorator -> Data object message -> Default
        message: messageFromDecorator || data?.message || 'Operation successful',
        data: data?.result || data,
      })),
    );
  }
}