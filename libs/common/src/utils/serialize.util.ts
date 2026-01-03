import { plainToClass, ClassConstructor } from 'class-transformer';
import { classToPlain } from 'class-transformer';

/**
 * Serialize entity to DTO, excluding sensitive fields
 */
export function serialize<T, V>(
  dto: ClassConstructor<T>,
  entity: V | V[],
): T | T[] {
  if (Array.isArray(entity)) {
    return entity.map((item) => plainToClass(dto, item, { excludeExtraneousValues: true }));
  }
  return plainToClass(dto, entity, { excludeExtraneousValues: true });
}

/**
 * Exclude sensitive fields from plain object
 */
export function excludeFields<T extends Record<string, any>>(
  obj: T,
  fields: (keyof T)[],
): Partial<T> {
  const result = { ...obj };
  fields.forEach((field) => {
    delete result[field];
  });
  return result;
}
