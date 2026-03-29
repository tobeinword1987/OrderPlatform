import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/user.entity';
import { UsersModule } from 'src/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from 'src/config-service';
import { RefreshTokens } from 'src/users/refreshTokens.entity';
import { JwtStrategy } from './jwt.strategy';
import { LogInStrategy } from './log.in.strategy';
import { UsersRoles } from 'src/users/usersRoles.entity';
import { Role } from 'src/users/role.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([RefreshTokens, User, UsersRoles, Role]),
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      extraProviders: [ConfigService],
      inject: [ConfigService],
      useFactory: (conf: ConfigService) => ({
        secret: conf.get('JWT_SECRET'),
        signOptions: { expiresIn: '1d' },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy, LogInStrategy],
  exports: [AuthService],
})
export class AuthModule {}
