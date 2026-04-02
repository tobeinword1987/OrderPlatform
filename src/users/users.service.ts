import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { UUID } from 'crypto';
import { UploadFile } from '../../src/files/file.entity';
import { S3Service } from '../../src/files/s3.service';
import { Status } from '../../src/files/file.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepository: Repository<User>,
    @InjectRepository(UploadFile)
    private fileRepository: Repository<UploadFile>,
    private s3Service: S3Service,
  ) {}

  async setAvatarId(user: User, fileId: UUID) {
    const userDb = await this.usersRepository.findOneBy({ id: user.id });
    if (!userDb) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }

    const file = await this.fileRepository.findOneBy({ id: fileId });
    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }

    if (file.status !== Status.READY) {
      throw new HttpException(
        'File is not fully uploaded to the storage',
        HttpStatus.NOT_FOUND,
      );
    }

    if (user.id !== file.userId) {
      throw new HttpException(
        'User is not the owner of this file',
        HttpStatus.FORBIDDEN,
      );
    }

    await this.usersRepository.update({ id: user.id }, { avatarId: fileId });

    return {
      id: user.id,
      avatarId: fileId,
      avatarUrl: this.s3Service.buildPublicUrl(file.key),
    };
  }

  async listUsers(): Promise<Array<User>> {
    const users = await this.usersRepository.find();
    return users;
  }

  async findUserById(id: string): Promise<User | null> {
    const user = (await this.usersRepository.findOneBy({ id })) || null;
    if (!user) {
      throw new HttpException('User was not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async findUserByLogin(login: string): Promise<User | null> {
    const user = (await this.usersRepository.findOneBy({ login })) || null;
    if (!user) {
      throw new HttpException('User was not found', HttpStatus.NOT_FOUND);
    }
    return user;
  }

  async remove(id: number): Promise<void> {
    await this.usersRepository.delete(id);
  }
}
