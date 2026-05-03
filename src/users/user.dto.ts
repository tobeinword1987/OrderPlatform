import { Entity } from 'typeorm';
import { UUID } from 'crypto';
import { OmitType } from '@nestjs/swagger';
import { User as UserEntity } from './user.entity';

@Entity()
export class User {
  firstName: string;
  lastName: string;
}

export class SetAvatarDto {
  fileId: UUID;
}

export class SetAvatarResponseDto {
  id: string;
  avatarId: UUID;
  avatarUrl: string;
}

export class ListUserDto extends OmitType(UserEntity, [
  'orders',
  'files',
  'avatar',
  'roles',
] as const) {}
