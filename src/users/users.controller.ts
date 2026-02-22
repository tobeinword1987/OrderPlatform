import { Controller, Get, Post } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.entity';
import { Roles } from 'src/decorators/roles.decorator';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  listUsers(): Promise<Array<User>> {
    return this.usersService.listUsers();
  }

  @Roles(['user'])
  @Post()
  setAvatar() {

  }

}
