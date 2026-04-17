import { User } from '../users/user.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { OrderItem } from './order.item.entity';
import {
  Field,
  Float,
  GraphQLISODateTime,
  ID,
  ObjectType,
  registerEnumType,
} from '@nestjs/graphql';
import { ORDER_STATUS } from './order.dto';
import type { UUID } from 'crypto';
import { ProcessedMessage } from './processed.message.entity';

registerEnumType(ORDER_STATUS, { name: 'OrderStatus' });

@Entity()
@ObjectType()
@Index('Index_order_user_id', ['userId'])
@Index('Index_order_created_at', ['createdAt'])
@Index('Index_idempotency_key_unique', ['idempotencyKey'], { unique: true })
@Index('Index_created_at_order_status', ['createdAt', 'orderStatus'], {
  unique: false,
})
export class Order {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { nullable: false })
  id: UUID;

  @Column({ name: 'idempotency_key' })
  @Field(() => String, { name: 'idempotency_key', nullable: false })
  idempotencyKey: string;

  @Column({ name: 'delivery_address' })
  @Field(() => String, { name: 'delivery_address', nullable: false })
  deliveryAddress: string;

  @Column({
    type: 'enum',
    enum: ORDER_STATUS,
    enumName: 'order_status_enum',
    default: ORDER_STATUS.CREATED,
    name: 'order_status',
  })
  @Field(() => ORDER_STATUS, { name: 'order_status', nullable: false })
  orderStatus: ORDER_STATUS;

  @Column({ type: 'uuid', name: 'user_id' })
  @Field(() => ID, { name: 'user_id', nullable: false })
  userId: string;

  @Column({ type: 'float', name: 'total_price_at_purchase', default: 0 })
  @Field(() => Float, { name: 'total_price_at_purchase', nullable: false })
  totalPriceAtPurchase: number;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  @Field(() => User, { nullable: false })
  user?: User;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.order)
  @Field(() => [OrderItem])
  orderItems?: OrderItem[];

  @CreateDateColumn({ type: 'timestamptz', name: 'created_at' })
  @Field(() => GraphQLISODateTime, { name: 'created_at', nullable: false })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamptz', name: 'updated_at' })
  @Field(() => GraphQLISODateTime, { name: 'updated_at', nullable: false })
  updatedAt: Date;

  @OneToOne(
    () => ProcessedMessage,
    (processedMessage) => processedMessage.order,
  )
  processedMessage?: ProcessedMessage;
}
