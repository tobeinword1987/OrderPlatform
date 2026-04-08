import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { Order } from '../orders/order.entity';
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Role } from './role.entity';
import { UploadFile } from '../files/file.entity';
import type { UUID } from 'crypto';

@Entity()
@ObjectType()
@Index('Index_users_email_unique', ['email'], { unique: true })
@Index('Index_users_login_unique', ['email'], { unique: true })
@Index('Index_users_login_password_unique', ['login', 'password'], {
  unique: true,
})
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { nullable: false })
  id: string;

  @Column({ name: 'login' })
  @Field(() => String, { name: 'login', nullable: false })
  login: string;

  @Column({ name: 'password' })
  @Field(() => String, { name: 'password', nullable: false })
  password: string;

  @Column({ name: 'first_name' })
  @Field(() => String, { name: 'first_name', nullable: false })
  firstName: string;

  @Column({ name: 'last_name' })
  @Field(() => String, { nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ name: 'email' })
  @Field(() => String, { nullable: false })
  email: string;

  @Column({ name: 'address' })
  @Field(() => String)
  address: string;

  @Column({ name: 'phone_number' })
  @Field(() => String, { nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'post_code' })
  @Field(() => String, { name: 'post_code', nullable: false })
  postCode: string;

  @Column({ default: true, name: 'is_active' })
  @Field(() => Boolean, {
    defaultValue: true,
    name: 'is_active',
    nullable: false,
  })
  isActive: boolean;

  @Column({ type: 'uuid', name: 'avatar_id', nullable: true })
  avatarId: UUID;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Field(() => GraphQLISODateTime, { name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @Field(() => GraphQLISODateTime, { name: 'updated_at', nullable: false })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  @Field(() => [Order], { nullable: false })
  orders: Order[];

  @OneToMany(() => UploadFile, (file) => file.user, { nullable: true })
  files?: UploadFile[];

  @ManyToMany(() => Role, (role) => role.users)
  @JoinTable()
  roles?: Role[];

  @OneToOne(() => UploadFile, (file) => file.user, { nullable: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar?: UploadFile;
}
