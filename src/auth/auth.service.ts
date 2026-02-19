import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { hashdata } from '../utils/helper'

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) { }

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findUserByLogin(username);
    console.log('!!!!!!!!!!!!!!!!', user);
    const hashedPassword = hashdata(pass);
    if (user && user.password === hashedPassword) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }
}
