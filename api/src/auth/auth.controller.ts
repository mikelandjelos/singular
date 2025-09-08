import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiCookieAuth,
} from '@nestjs/swagger';
import { type Request, type Response } from 'express';

import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtAuthGuard } from './guards/jwt.guard';
import { RegisterDto, LoginDto } from './auth.dto';
import { UserResponseDto } from '../user/user.dto';

@ApiTags('auth')
@ApiCookieAuth('access_token')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly auth: AuthService,
    private readonly users: UserService,
  ) {}

  @ApiOperation({ summary: 'Register new user' })
  @ApiCreatedResponse({ type: UserResponseDto })
  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    const user = await this.users.create(registerDto);
    return this.users.sanitize(user);
  }

  @ApiOperation({ summary: 'Login (sets httpOnly cookie)' })
  @ApiOkResponse({ type: UserResponseDto })
  @Post('login')
  async login(
    @Body() body: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const user = await this.auth.validateCredentials(body.email, body.password);
    if (!user) throw new UnauthorizedException('Invalid credentials');

    const token = await this.auth.issueAccessToken(user);
    res.cookie('access_token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.COOKIE_SECURE === 'true',
      maxAge: 1000 * 60 * 60, // 1h
      path: '/',
    });

    return { user: this.users.sanitize(user) };
  }

  @ApiOperation({ summary: 'Logout (clears cookie)' })
  @UseGuards(JwtAuthGuard)
  @Post('logout')
  logout(@Res({ passthrough: true }) res: Response) {
    res.clearCookie('access_token', { path: '/' });
    return { ok: true };
  }

  @ApiOperation({ summary: 'Get current user (requires cookie)' })
  @UseGuards(JwtAuthGuard)
  @ApiOkResponse({ type: UserResponseDto })
  @Get('me')
  async me(@Req() req: Request) {
    const principal = req.user as { userId: string; email: string };
    console.log(principal);
    const full = await this.users.findById(principal.userId);
    return full ? this.users.sanitize(full) : null;
  }
}
