import { User } from '../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order.item.entity';
import { Field, GraphQLISODateTime, ID, ObjectType } from '@nestjs/graphql';
import { ORDER_STATUS } from './order.dto';

@Entity()
@ObjectType()
@Index('Index_order_user_id', ['userId'])
@Index('Index_order_created_at', ['createdAt'])
@Index('Index_idempotency_key_unique', ['idempotencyKey'], { unique: true })
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column({ name: 'idempotency_key' })
  @Field(() => String!, { name: 'idempotency_key' })
  idempotencyKey: string;

  @Column({ name: 'delivery_address' })
  @Field(() => String!, { name: 'delivery_address' })
  deliveryAddress: string;

  @Column({ type: 'enum', enum: ORDER_STATUS, enumName: 'order_status_enum', default: ORDER_STATUS.CREATED, name: 'order_status '})
  @Field(() => String, { name: 'order_status' })
  orderStatus: ORDER_STATUS

  @Column({ type: 'uuid', name: 'user_id' })
  @Field(() => ID!, { name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @Field(() => User!)
  user: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  @Field(() => [OrderItem])
  orderItems: OrderItem[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Field(() => GraphQLISODateTime!, { name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @Field(() => GraphQLISODateTime!, { name: 'updated_at' })
  updatedAt: Date;
}
