import { UserStatus } from '@app/common';
import { IsEmail, IsOptional, IsString, IsEnum, IsArray } from 'class-validator';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @IsOptional()
  @IsString()
  username?: string;

  @IsString()
  firstname: string;

  @IsString()
  lastname: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsString()
  password: string;

  @IsOptional()
  status?: UserStatus;

  /**
   * Roles assigned to the user
   * Default: [UserRole.CLIENT]
   */
  @IsOptional()
  @IsArray()
  @IsEnum(UserRole, { each: true })
  roles?: UserRole[];

  /**
   * Active role for the user
   * Must be one of the assigned roles
   */
  @IsOptional()
  @IsEnum(UserRole)
  activeRole?: UserRole;
}
