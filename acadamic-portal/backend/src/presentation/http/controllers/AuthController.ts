import { Controller, Post, Get, Body, Req, UseGuards, UnauthorizedException } from '@nestjs/common';
import { AuthUseCase, LoginDto } from '../../../application/use-cases/AuthUseCase';
import { JwtAuthGuard } from '../../../infrastructure/security/JwtAuthGuard';

@Controller('api/auth')
export class AuthController {
  constructor(private readonly authUseCase: AuthUseCase) {}

  @Post('login')
  async login(@Body() dto: LoginDto) {
    try {
      return await this.authUseCase.login(dto);
    } catch (err: any) {
      throw new UnauthorizedException(err.message || 'Login failed');
    }
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() req: any) {
    return await this.authUseCase.getProfile(req.user.sub);
  }
}
