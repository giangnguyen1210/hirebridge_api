import { IsEnum, IsArray } from 'class-validator';
import { UserRole } from '../entities/user.entity';

/**
 * DTO for assigning a single role to a user
 */
export class AssignRoleDto {
  @IsEnum(UserRole)
  role: UserRole;
}

/**
 * DTO for syncing all user roles
 */
export class SyncRolesDto {
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles: UserRole[];
}

/**
 * DTO for setting active role
 */
export class SetActiveRoleDto {
  @IsEnum(UserRole)
  activeRole: UserRole;
}
