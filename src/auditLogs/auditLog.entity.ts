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

  @Column({ type: 'uuid', name: 'actor_id' })
  @Field(() => ID, { name: 'actor_id', nullable: false })
  actorId: string;

  @Column({ type: 'uuid', name: 'target_id', nullable: true })
  @Field(() => ID, { name: 'target_id', nullable: true })
  targetId: string;

  @Column({ name: 'action' })
  @Field(() => String, { name: 'action', nullable: false })
  action: string;

  @Column({ name: 'target_type' })
  @Field(() => String, { name: 'target_type', nullable: false })
  targetType: string;

  @Column({ name: 'outcome' })
  @Field(() => String, { name: 'outcome', nullable: false })
  outcome: string;

  @Column({ name: 'correlation_id' })
  @Field(() => String, { name: 'correlation_id', nullable: false })
  correlationId: string;

  @Column({ name: 'reason' })
  @Field(() => String, { name: 'reason', nullable: false })
  reason: string;

  @Column({ name: 'error_code' })
  @Field(() => String, { name: 'statusCode', nullable: false })
  statusCode: string;

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
