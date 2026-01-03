import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min, IsEnum } from 'class-validator';

export enum SortOrder {
  ASC = 'ASC',
  DESC = 'DESC',
}

/**
 * DTO for pagination query parameters
 */
export class PaginationDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit: number = 10;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  skip?: number;

  get calculatedSkip(): number {
    if (this.skip !== undefined) {
      return this.skip;
    }
    return (this.page - 1) * this.limit;
  }
}

/**
 * Metadata for paginated responses
 */
export class PageMetaDto {
  readonly page: number;
  readonly limit: number;
  readonly total: number;
  readonly totalPages: number;
  readonly hasNextPage: boolean;
  readonly hasPreviousPage: boolean;

  constructor(paginationDto: PaginationDto, total: number) {
    this.page = paginationDto.page!;
    this.limit = paginationDto.limit!;
    this.total = total;
    this.totalPages = Math.ceil(total / this.limit);
    this.hasNextPage = this.page < this.totalPages;
    this.hasPreviousPage = this.page > 1;
  }
}

/**
 * Generic paginated response wrapper
 */
export class PaginatedResponseDto<T> {
  readonly data: T[];
  readonly meta: PageMetaDto;

  constructor(data: T[], meta: PageMetaDto) {
    this.data = data;
    this.meta = meta;
  }
}
