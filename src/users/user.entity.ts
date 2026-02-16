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
} from 'typeorm';

@Entity()
@ObjectType()
@Index('Index_users_email_unique', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column({ name: 'first_name' })
  @Field(() => String!, { name: 'first_name' })
  firstName: string;

  @Column({ name: 'last_name' })
  @Field(() => String, { nullable: true, name: 'last_name' })
  lastName: string;

  @Column({ name: 'email' })
  @Field(() => String!)
  email: string;

  @Column({ name: 'address' })
  @Field(() => String)
  address: string;

  @Column({ name: 'phone_number' })
  @Field(() => String, { nullable: true, name: 'phone_number' })
  phoneNumber: string;

  @Column({ name: 'post_code' })
  @Field(() => String!, { name: 'post_code' })
  postCode: string;

  @Column({ default: true, name: 'is_active' })
  @Field(() => Boolean!, { defaultValue: true, name: 'is_active' })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Field(() => GraphQLISODateTime!, { name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @Field(() => GraphQLISODateTime!, { name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Order, (order) => order.user)
  @Field(() => [Order]!)
  orders: Order[];
}
