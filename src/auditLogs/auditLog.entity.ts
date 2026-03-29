import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
@Index('Index_audit_log_created_at', ['createdAt'])
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { nullable: false })
  id: string;

  @Column({ name: 'log' })
  @Field(() => String, { name: 'log', nullable: false })
  log: string;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Field(() => GraphQLISODateTime, { name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @Field(() => GraphQLISODateTime, { name: 'updated_at', nullable: false })
  updatedAt: Date;
}
