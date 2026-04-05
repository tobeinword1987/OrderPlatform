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
  @Field(() => ID, { nullable: false })
  id: string;

  @Column({ name: 'scope' })
  @Field(() => String, { name: 'scope', nullable: false })
  scope: string;

  @ManyToMany(() => Role, (role) => role.scopes)
  roles: Role[];
}
