import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  ManyToMany,
} from 'typeorm';
import { Role } from './role.entity';

@Entity()
@ObjectType()
@Index('Index_scope_unique', ['scope'], { unique: true })
export class Scope {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column({ name: 'scope' })
  @Field(() => String!, { name: 'scope' })
  scope: string;

  @ManyToMany(
    () => Role,
    role => role.scopes,
  )
  roles: Role[];
}
