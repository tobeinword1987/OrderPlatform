import { Body, Controller,  Get,  Post, Request, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LogInAuthGuard } from './auth/log.in.guard';

@Controller()
export class AppController {

  constructor(private authService: AuthService) {}

  @UseGuards(LogInAuthGuard)
  @Post('auth/login')
  async login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/refresh')
  async refreshToken(@Body('refreshToken') refreshToken: string, @Request() req: any) {
    return this.authService.refreshToken(req.user, refreshToken);
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Request() req: any) {
    return req.user;
  }
}
