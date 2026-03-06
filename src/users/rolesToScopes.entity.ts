import { Field, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  JoinColumn,
  Index,
  ManyToOne,
} from 'typeorm';
import { Role } from './role.entity';
import { Scope } from './scope.entity';

@Entity('role_to_scope')
@ObjectType()
@Index('Index_role_scope_unique', ['roleId', 'scopeId'], { unique: true })
export class RolesToScopes {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column({ name: 'role_id' })
  @Field(() => String!, { name: 'role_id' })
  roleId: string;

  @Column({ name: 'scope_id' })
  @Field(() => String!, { name: 'scope_id' })
  scopeId: string;

  @ManyToOne(
    () => Scope,
    scope => scope.roles
  )
  @JoinColumn([{ name: 'scope_id', referencedColumnName: 'id' }])
  scopes: Scope[];

  @ManyToOne(
    () => Role,
    role => role.scopes
  )
  @JoinColumn([{ name: 'role_id', referencedColumnName: 'id' }])
  roles: Role[];
}
