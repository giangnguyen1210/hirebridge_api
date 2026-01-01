import {
  Controller,
  Post,
  Body,
  Patch,
  Get,
  Headers,
  Param,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UsersService } from '../services/user.service';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '@app/common';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService
  ) {}

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.registerUser(registerUserDto);
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  async hello() {
    return this.usersService.findAll();
  }

  // @UseGuards(JwtAuthGuard)
  @Get()
  async findOne(@User('id') userId: string) {
    return this.usersService.findOne(userId);
  }
}

