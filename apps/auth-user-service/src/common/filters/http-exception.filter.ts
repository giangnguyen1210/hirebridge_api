import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError, EntityNotFoundError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();
      
      // Handle standard NestJS validation errors (class-validator)
      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
         message = (exceptionResponse as any).message || exception.message;
         error = (exceptionResponse as any).error || exception.name;
      } else {
         message = exception.message;
      }
    } 
    // Handle TypeORM Entity Not Found
    else if (exception instanceof EntityNotFoundError) {
      status = HttpStatus.NOT_FOUND;
      message = 'Resource not found';
      error = 'Not Found';
    } 
    // Handle Database Constraints (e.g., duplicate unique key)
    else if (exception instanceof QueryFailedError) {
      status = HttpStatus.CONFLICT;
      message = 'Database conflict error (Duplicate entry or constraint violation)';
      error = 'Conflict';
      // You can parse (exception as any).driverError.detail for specific SQL details
    }

    this.logger.error(`Status: ${status} Error: ${JSON.stringify(message)}`);

    response.status(status).json({
      statusCode: status,
      message: message,
      error: error,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}