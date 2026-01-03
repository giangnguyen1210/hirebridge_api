import { PageMetaDto } from '../dtos/pagination.dto';

export interface ApiResponse<T = any> {
  success: boolean;
  statusCode: number;
  message: string;
  data?: T;
  meta?: PageMetaDto;
  error?: ErrorDetail;
  timestamp: string;
}

export interface ErrorDetail {
  code: string;
  details?: any;
  path?: string;
  requestId?: string;
}

export interface ValidationError {
  field: string;
  message: string;
  value?: any;
}