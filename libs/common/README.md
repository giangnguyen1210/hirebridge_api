# Common Library (@app/common)

## Overview
Shared utilities, DTOs, interfaces, and decorators for the HireBridge microservices monorepo.

## Components

### DTOs (`@app/common/dtos`)

#### Pagination
```typescript
import { PaginationDto, PageMetaDto, PaginatedResponseDto } from '@app/common';

// In controller
@Get()
async findAll(@Query() paginationDto: PaginationDto) {
  return this.service.findAll(paginationDto);
}

// In service
async findAll(paginationDto: PaginationDto) {
  const [data, total] = await this.repository.findAndCount({
    skip: paginationDto.calculatedSkip,
    take: paginationDto.limit,
  });

  const meta = new PageMetaDto(paginationDto, total);

  return {
    data,
    meta,
    message: 'Successfully retrieved',
  };
}
```

#### Filters
```typescript
import { FilterDto, DateRangeDto } from '@app/common';

@Get()
async search(@Query() filterDto: FilterDto) {
  // filterDto.search
  // filterDto.sortBy
  // filterDto.sortOrder
}
```

#### Response DTOs
```typescript
import { SuccessResponseDto, ErrorResponseDto } from '@app/common';

// Manually create responses (usually not needed with interceptors)
const response = new SuccessResponseDto('User created', user);
const error = new ErrorResponseDto('Not found', 'RESOURCE_NOT_FOUND');
```

### Interfaces

```typescript
import { ApiResponse, ErrorDetail, ValidationError } from '@app/common';

// All responses automatically match ApiResponse interface
function handleResponse(response: ApiResponse<User>) {
  if (response.success) {
    console.log(response.data);
  }
}
```

### Interceptors

```typescript
import { TransformInterceptor } from '@app/common';

// Apply globally in main.ts
app.useGlobalInterceptors(
  new TransformInterceptor(app.get(Reflector))
);
```

### Filters

```typescript
import { HttpExceptionFilter, AllExceptionsFilter } from '@app/common';

// Apply globally in main.ts
app.useGlobalFilters(
  new AllExceptionsFilter(),
  new HttpExceptionFilter(),
);
```

### Decorators

```typescript
import { 
  Public, 
  ResponseMessage, 
  ApiPaginatedResponse,
  User 
} from '@app/common';

// Public route (skip auth)
@Public()
@Get('public')
async publicRoute() {}

// Custom response message
@ResponseMessage('User retrieved successfully')
@Get(':id')
async findOne(@Param('id') id: string) {}

// Swagger paginated response
@ApiPaginatedResponse(UserEntity)
@Get()
async findAll() {}

// Get user from request
@Get('me')
async getMe(@User('id') userId: string) {}
```

### Constants

```typescript
import { ERROR_CODES } from '@app/common';

throw new NotFoundException({
  message: 'User not found',
  error: ERROR_CODES.RESOURCE.NOT_FOUND,
});
```

### Utils

```typescript
import { serialize, excludeFields } from '@app/common';

// Serialize entity to DTO
const userDto = serialize(UserResponseDto, user);

// Exclude sensitive fields
const safeUser = excludeFields(user, ['password', 'refreshToken']);
```

## Complete Setup Example

### main.ts
```typescript
import { NestFactory, Reflector } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { 
  TransformInterceptor,
  HttpExceptionFilter,
  AllExceptionsFilter 
} from '@app/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  // Global interceptors
  app.useGlobalInterceptors(
    new TransformInterceptor(app.get(Reflector))
  );

  // Global filters (order matters!)
  app.useGlobalFilters(
    new AllExceptionsFilter(),
    new HttpExceptionFilter(),
  );

  await app.listen(3000);
}
bootstrap();
```

### Controller Example
```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Patch,
  Delete,
} from '@nestjs/common';
import {
  PaginationDto,
  ResponseMessage,
  ApiPaginatedResponse,
  Public,
} from '@app/common';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Public()
  @Post('register')
  @ResponseMessage('User registered successfully')
  async register(@Body() dto: RegisterUserDto) {
    return this.usersService.register(dto);
  }

  @Get()
  @ApiPaginatedResponse(UserEntity)
  async findAll(@Query() paginationDto: PaginationDto) {
    return this.usersService.findAll(paginationDto);
  }

  @Get(':id')
  @ResponseMessage('User retrieved successfully')
  async findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.usersService.update(id, dto);
  }
}
```

### Service Example
```typescript
import { Injectable, NotFoundException } from '@nestjs/common';
import { 
  PaginationDto, 
  PageMetaDto,
  ERROR_CODES 
} from '@app/common';

@Injectable()
export class UsersService {
  async findAll(paginationDto: PaginationDto) {
    const [data, total] = await this.repository.findAndCount({
      skip: paginationDto.calculatedSkip,
      take: paginationDto.limit,
    });

    const meta = new PageMetaDto(paginationDto, total);

    return {
      data,
      meta,
      message: 'Users retrieved successfully',
    };
  }

  async findOne(id: string) {
    const user = await this.repository.findOne({ where: { id } });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      data: user,
      message: 'User retrieved successfully',
    };
  }
}
```

## Response Format Examples

### Success Response
```json
{
  "success": true,
  "statusCode": 200,
  "message": "Users retrieved successfully",
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNextPage": true,
    "hasPreviousPage": false
  },
  "timestamp": "2026-01-02T22:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "message": "Validation failed",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "email",
        "message": "email must be an email",
        "value": "invalid-email"
      }
    ],
    "requestId": "req-123"
  },
  "path": "/api/users",
  "timestamp": "2026-01-02T22:00:00.000Z"
}
```

## Migration Guide

### From Old Response Format
```typescript
// Old
return {
  statusCode: 200,
  message: 'Success',
  data: users,
};

// New (handled automatically by interceptor)
return {
  data: users,
  message: 'Success', // Optional
};

// Or with pagination
return {
  data: users,
  meta: new PageMetaDto(paginationDto, total),
  message: 'Success',
};
```

## Best Practices

1. ✅ Always use `PaginationDto` for lists
2. ✅ Return `{ data, meta, message }` from services
3. ✅ Use `@ResponseMessage()` for custom messages
4. ✅ Let interceptors handle response transformation
5. ✅ Use standard `ERROR_CODES` for consistency
6. ✅ Apply filters globally in main.ts
7. ✅ Use `@Public()` for public routes
8. ✅ Document pagination with `@ApiPaginatedResponse()`
