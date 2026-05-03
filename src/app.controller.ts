import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { AuthService } from './auth/auth.service';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { LogInAuthGuard } from './auth/log.in.guard';
import { AuthorizedDto, LoginDto, RefreshTokenDto } from './auth/auth.dto';
import { Public } from './decorators/public';
import { User } from './users/user.entity';
import { AppService } from './app.service';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import {
  HealthCheckService,
  HttpHealthIndicator,
  HealthCheck,
} from '@nestjs/terminus';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(
    private authService: AuthService,
    private appService: AppService,
    private health: HealthCheckService,
    private http: HttpHealthIndicator,
    private configService: ConfigService,
  ) {}

  @UseGuards(ThrottlerGuard, LogInAuthGuard)
  @Throttle({ medium: {} })
  @Public()
  @Post('auth/login')
  @ApiResponse({ status: 201, description: 'Authorized', type: AuthorizedDto })
  @ApiResponse({ status: 404, description: 'User was not found' })
  async login(
    @Req() request: Request & { user: User },
    @Body() _loginDto: LoginDto,
  ) {
    return this.authService.login(request.user);
  }

  @ApiBearerAuth()
  @UseGuards(ThrottlerGuard, JwtAuthGuard)
  @Throttle({ medium: {} })
  @Post('auth/refresh')
  @ApiResponse({
    status: 201,
    description: 'Token was refreshed',
    type: AuthorizedDto,
  })
  async refreshToken(
    @Req() request: Request & { user: User },
    @Body() refreshTokenBody: RefreshTokenDto,
  ) {
    return this.authService.refreshToken(request.user, refreshTokenBody);
  }

  @Public()
  @Get()
  getMessage(): { msg: string } {
    return this.appService.getHello();
  }

  @Public()
  @Get('health')
  @HealthCheck()
  check() {
    const url: string = this.configService.get('BASE_URL') || '';
    return this.health.check([() => this.http.pingCheck('app', url)]);
  }
}
