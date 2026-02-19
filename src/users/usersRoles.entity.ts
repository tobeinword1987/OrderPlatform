import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity('user_role')
@ObjectType()
// @Index('Index_users_roles_unique', ['userId', 'roleId'], { unique: true })
export class UsersRoles {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column({ type: 'uuid', name: 'user_id' })
  @Field(() => String!, { name: 'user_id' })
  userId: string;

  @Column({ type: 'uuid', name: 'role_id' })
  @Field(() => String!, { name: 'role_id' })
  roleId: string;

  @ManyToOne(
    () => User,
    user => user.roles
  )
  @JoinColumn([{ name: 'user_id', referencedColumnName: 'id' }])
  users: User[];

  @ManyToOne(
    () => Role,
    role => role.users
  )
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'id' }])
  roles: Role[];
}
