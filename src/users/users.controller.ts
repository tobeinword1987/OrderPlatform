import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Roles } from 'src/decorators/roles.decorator';
import { Request } from 'express';
import type { UUID } from 'crypto';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  listUsers(): Promise<Array<User>> {
    return this.usersService.listUsers();
  }

  @Roles(['user', 'admin'])
  @Post('/avatar')
  setAvatar(
    @Req() request: Request & { user?: User },
    @Body('fileId') fileId: UUID,
  ) {
    return this.usersService.setAvatarId(request.user as User, fileId);
  }
}
