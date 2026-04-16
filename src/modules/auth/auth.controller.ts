import { Controller, Post, Body, Get, Headers, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() body: { email: string; password: string; firstName: string; lastName: string }) {
    return this.authService.register(body.email, body.password, body.firstName, body.lastName);
  }

  @Post('login')
  async login(@Body() body: { email: string; password: string }) {
    return this.authService.login(body.email, body.password);
  }

  @Post('logout')
  async logout(@Headers('authorization') auth: string) {
    const token = auth?.replace('Bearer ', '') || '';
    return this.authService.logout(token);
  }

  @Get('profile')
  @UseGuards(AuthGuard('supabase'))
  getProfile() {
    return { message: 'Autenticado correctamente' };
  }
}
