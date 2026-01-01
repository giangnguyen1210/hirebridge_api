import { IsEmail, IsOptional, IsString } from 'class-validator';
import { UserStatus } from '@app/common';

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
}
