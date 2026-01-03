import { IsOptional, IsString, IsEnum, IsDateString } from 'class-validator';
import { SortOrder } from './pagination.dto';

/**
 * Base filter DTO with search and sorting
 */
export class FilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder = SortOrder.ASC;
}

/**
 * Date range filter DTO
 */
export class DateRangeDto {
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @IsOptional()
  @IsDateString()
  endDate?: string;
}
