/**
 * Standard success response DTO
 */
export class SuccessResponseDto<T = any> {
  readonly success: boolean = true;
  readonly message: string;
  readonly data?: T;
  readonly timestamp: string;

  constructor(message: string, data?: T) {
    this.message = message;
    this.data = data;
    this.timestamp = new Date().toISOString();
  }
}

/**
 * Validation error detail
 */
export class ValidationErrorDetail {
  readonly field: string;
  readonly message: string;
  readonly value?: any;

  constructor(field: string, message: string, value?: any) {
    this.field = field;
    this.message = message;
    this.value = value;
  }
}

/**
 * Error response DTO
 */
export class ErrorResponseDto {
  readonly success: boolean = false;
  readonly message: string;
  readonly error: {
    code: string;
    details?: any;
    requestId?: string;
  };
  readonly timestamp: string;
  readonly path?: string;

  constructor(
    message: string,
    code: string,
    details?: any,
    path?: string,
    requestId?: string,
  ) {
    this.message = message;
    this.error = {
      code,
      details,
      requestId,
    };
    this.path = path;
    this.timestamp = new Date().toISOString();
  }
}
