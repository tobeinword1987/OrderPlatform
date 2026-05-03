import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { ListUserDto, SetAvatarDto, SetAvatarResponseDto } from './user.dto';
import { Roles } from '../../src/decorators/roles.decorator';
import { Request } from 'express';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';

@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  @ApiResponse({ status: 200, description: 'List of users', type: ListUserDto })
  listUsers(): Promise<Array<User>> {
    return this.usersService.listUsers();
  }

  @Roles(['user', 'admin'])
  @Post('/avatar')
  @ApiResponse({
    description: 'Avatar was set',
    status: 201,
    type: SetAvatarResponseDto,
  })
  setAvatar(
    @Req() request: Request & { user?: User },
    @Body() body: SetAvatarDto,
  ) {
    return this.usersService.setAvatarId(request.user as User, body.fileId);
  }
}
