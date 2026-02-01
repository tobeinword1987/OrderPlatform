import { Injectable } from '@nestjs/common';
import { users } from './users.dto';

@Injectable()
export class UsersService {
  listUsers(): Array<{ name: string; lastName: string }> {
    return users;
  }
}
