import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ErrorResponseDto } from '../dtos/response.dto';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Default values for non-HTTP exceptions
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'An unexpected error occurred';
    let code = 'INTERNAL_SERVER_ERROR';

    // Check if this is a NestJS HttpException
    if (exception && typeof exception === 'object' && 'getStatus' in exception) {
      const httpException = exception as any;
      status = httpException.getStatus();
      
      // Extract message from exception
      const exceptionResponse = httpException.getResponse();
      if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else if (exceptionResponse && typeof exceptionResponse === 'object') {
        message = exceptionResponse.message || message;
        code = exceptionResponse.error || this.getErrorCode(status);
      } else {
        code = this.getErrorCode(status);
      }
    }

    // Log the error for debugging
    this.logger.error(
      `[${status}] ${request.method} ${request.url} - ${exception instanceof Error ? exception.message : 'Unknown error'}`,
      exception instanceof Error ? exception.stack : undefined,
    );

    const errorResponse = new ErrorResponseDto(
      message,
      code,
      undefined, // Don't expose internal error details in production
      request.url,
      request.headers['x-request-id'] as string,
    );

    response.status(status).json(errorResponse);
  }

  private getErrorCode(status: number): string {
    const errorCodes: Record<number, string> = {
      400: 'BAD_REQUEST',
      401: 'UNAUTHORIZED',
      403: 'FORBIDDEN',
      404: 'NOT_FOUND',
      409: 'CONFLICT',
      422: 'UNPROCESSABLE_ENTITY',
      500: 'INTERNAL_SERVER_ERROR',
    };
    return errorCodes[status] || 'UNKNOWN_ERROR';
  }
}
