import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User, User as UserDb } from './user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserDb)
    private usersRepository: Repository<UserDb>,
  ) {}

  async listUsers(): Promise<Array<User>> {
    const users = await this.usersRepository.find();
    return users;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = await this.usersRepository.findOneBy({ id }) || null;
    if(!user) {
      throw new HttpException('User was not found', HttpStatus.NOT_FOUND)
    }
    return user;
  }

  async findUserByLogin(login: string): Promise<UserDb | null> {
    const user = await this.usersRepository.findOneBy({ login }) || null;
    if(!user) {
      throw new HttpException('User was not found', HttpStatus.NOT_FOUND)
    }
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
