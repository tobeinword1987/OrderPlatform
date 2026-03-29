import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity('refresh_token')
@ObjectType()
@Index('Index_token_unique', ['token'], { unique: true })
export class RefreshTokens {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { nullable: false })
  id: string;

  @Column({ name: 'user_id' })
  @Field(() => String, { name: 'user_id', nullable: false })
  userId: string;

  @Column({ name: 'token' })
  @Field(() => String, { name: 'token', nullable: false })
  token: string;

  @Column({ name: 'is_active' })
  @Field(() => String, { nullable: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Field(() => GraphQLISODateTime, { name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @Field(() => GraphQLISODateTime, { name: 'updated_at', nullable: false })
  updatedAt: Date;
}
