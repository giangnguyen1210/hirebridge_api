import {
  Body,
  Controller,
  Get,
  HttpCode,
  Post,
  Headers,
  Req,
  UseGuards,
  HttpStatus,
  UnauthorizedException,
  Res,
  Patch,
} from '@nestjs/common';
import { ApiBody, ApiTags } from '@nestjs/swagger';
import { LoginDto } from '../dtos/login.dto';
import { AuthService } from '../services/auth.service';
import { LocalAuthGuard } from '../guards/local-auth.guard';
import { JwtRefreshAuthGuard } from '../guards/jwt-refresh-auth.guard';
import { ResponseMessage } from '@app/common';
import type { Response } from 'express';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UsersService } from '../services/user.service';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  // ==========================================
  // ENDPOINT FOR NGINX auth_request
  // ==========================================
  @Get('validate')
  @HttpCode(HttpStatus.OK)
  async validateToken(
    @Headers('authorization') authHeader: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    // [DEBUG LOG]
    console.log('--- Nginx called Validate ---');
    console.log('Auth Header:', authHeader ? 'Present' : 'Missing');
    console.log("🚀 ~ AuthController ~ validateToken ~ authHeader:", authHeader)

    if (!authHeader) {
      console.log('Error: Missing Header'); // Debug
      throw new UnauthorizedException('No authorization header');
    }

    const token = authHeader.replace(/^Bearer\s+/i, '');
    try {
      const payload = await this.authService.verifyToken(token);
      console.log("🚀 ~ AuthController ~ validateToken ~ payload:", payload)
      
      // [DEBUG LOG] Success
      console.log('Token Valid for User:', payload.sub);

      res.setHeader('X-User-Id', payload.sub);
      res.setHeader('X-User-Email', payload.email);
      // res.setHeader('X-User-Role', payload.role);
      
      return { success: true, userId: payload.sub };
    } catch (error) {
      // [DEBUG LOG] Error
      console.error('Token Verification Failed:', error.message);
      throw new UnauthorizedException('Invalid or expired token');
    }
  }

  @ResponseMessage('User login successfully')
  @UseGuards(LocalAuthGuard)
  @ApiBody({ type: LoginDto })
  @Post('login')
  async login(@Req() req, @Body() loginDto: LoginDto) {
    const user = req.user;
    return this.authService.login(user, loginDto);
  }

  @UseGuards(JwtRefreshAuthGuard)
  @Get('refresh-token')
  async refreshToken(@Req() req) {
    const user = req.user as any;
    // req.user lúc này chứa cả refreshToken do ta config ở RtStrategy
    return this.authService.refreshToken(user['sub'], user['refreshToken']);
  }
  
  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return this.usersService.registerUser(registerUserDto);
  }

  @Patch('verify')
  async verify(
    @Body('email') email: string,
    @Body('code') code: string
  ) {
    return this.usersService.verifyUser(email, code);
  }

  @Post('resend-activate')
  async resendActivateCode(
    @Body('email') email: string,
  ) {
    return this.usersService.resendActivateCode(email);
  }
  
}

