import { Controller, Get, Post, Req, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  listUsers(@Req() request: any): Promise<Array<User>> {
    console.log('###', request.user);
    return this.usersService.listUsers();
  }

  @Roles(['user'])
  @Post()
  setAvatar() {

  }

}
