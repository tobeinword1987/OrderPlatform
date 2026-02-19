import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Scope } from './scope.entity';
import { User } from './user.entity';

@Entity()
@ObjectType()
@Index('Index_role_unique', ['role'], { unique: true })
export class Role {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column({ name: 'role' })
  @Field(() => String!, { name: 'role' })
  role: string;

  @ManyToMany(
  () => Scope,
  scope => scope.roles) //optional
  @JoinTable(
  //   {
  //   name: 'role_to_scope',
  //   joinColumn: {
  //     name: 'role_id',
  //     referencedColumnName: 'id',
  //   },
  //   inverseJoinColumn: {
  //     name: 'scope_id',
  //     referencedColumnName: 'id',
  //   },
  // }
)
  scopes?: Scope[];

  @ManyToMany(
    () => User,
    user => user.roles,
  )
  users: User[];
}
