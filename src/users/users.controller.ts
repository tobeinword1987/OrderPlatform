import { Controller, Get } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from './user.dto';
import { Order } from 'src/orders/order.entity';

@Controller('users')
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Get()
  listUsers(): Promise<Array<User>> {
    return this.usersService.listUsers();
  }
}
