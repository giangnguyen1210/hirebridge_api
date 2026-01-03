import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto, ValidationErrorDetail } from '../dtos/response.dto';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse: any = exception.getResponse();

    // Extract error details
    let message = exception.message || 'An error occurred';
    let code = 'HTTP_EXCEPTION';
    let details: any;

    if (typeof exceptionResponse === 'object') {
      message = exceptionResponse.message || message;
      code = exceptionResponse.error?.toUpperCase().replace(/ /g, '_') || code;
      
      // Handle validation errors from class-validator
      if (Array.isArray(exceptionResponse.message)) {
        details = exceptionResponse.message.map((msg: any) => {
          if (typeof msg === 'object' && msg.constraints) {
            return new ValidationErrorDetail(
              msg.property,
              Object.values(msg.constraints).join(', '),
              msg.value,
            );
          }
          return msg;
        });
        code = 'VALIDATION_ERROR';
        message = 'Validation failed';
      }
    }

    const errorResponse = new ErrorResponseDto(
      message,
      code,
      details,
      request.url,
      request.headers['x-request-id'] as string,
    );

    response.status(status).json(errorResponse);
  }
}
