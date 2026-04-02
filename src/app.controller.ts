import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LogInAuthGuard } from './auth/log.in.guard';
import { Public } from './decorators/public';
import { User } from './users/user.entity';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private appService: AppService,
  ) {}

  @UseGuards(LogInAuthGuard)
  @Public()
  @Post('auth/login')
  async login(@Req() request: Request & { user: User }) {
    return this.authService.login(request.user);
  }

  @UseGuards(JwtAuthGuard)
  @Post('auth/refresh')
  async refreshToken(
    @Req() request: Request & { user: User },
    @Body() refreshTokenBody: { refresh_token: string },
  ) {
    console.log(request.user);
    return this.authService.refreshToken(request.user, refreshTokenBody);
  }

  @Public()
  @Get()
  getMessage(): { msg: string } {
    return this.appService.getHello();
  }
}
