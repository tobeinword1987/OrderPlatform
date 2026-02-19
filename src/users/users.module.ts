import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Scope } from './scope.entity';
import { RolesToScopes } from './rolesToScopes.entity';
import { UsersRoles } from './usersRoles.entity';
import { RefreshTokens } from './refreshTokens.entity';
import { UserResolver } from './user.resolver';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([User, Role, RolesToScopes, Scope, UsersRoles, RefreshTokens])],
  controllers: [UsersController],
  providers: [Repository<User>, UsersService, UserResolver],
  exports: [UsersService]
})
export class UsersModule { }
