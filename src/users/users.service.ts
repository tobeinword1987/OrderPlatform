import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User as UserDb } from './user.entity';
import { User } from './user.dto';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserDb)
    private usersRepository: Repository<UserDb>,
  ) {}

  async listUsers(): Promise<Array<User>> {
    const users = await this.usersRepository.find();
    return users.map((user) => this.convertDbUserToUser(user));
  }

  // findOne(id: number): Promise<User | null> {
  //   return this.usersRepository.findOneBy({ id });
  // }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }

  convertDbUserToUser(user: UserDb) {
    return {
      firstName: user.firstName,
      lastName: user.lastName,
    };
  }
}
