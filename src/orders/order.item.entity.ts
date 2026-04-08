import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { Field, Float, ID, ObjectType } from '@nestjs/graphql';

@Entity()
@ObjectType()
@Index('Index_order_item_order_id', ['orderId'])
@Index('Index_order_item_product_id', ['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { nullable: false })
  id: string;

  @Column()
  @Field(() => Number, { nullable: false })
  quantity: number;

  @Column({ type: 'float', name: 'price_at_purchase' })
  @Field(() => Float, { name: 'price_at_purchase', nullable: false })
  priceAtPurchase: number;

  @Column({ type: 'uuid', name: 'order_id' })
  @Field(() => ID, { name: 'order_id', nullable: false })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  @Field(() => Order, { nullable: false })
  order: Order;

  @Column({ type: 'uuid', name: 'product_id' })
  @Field(() => ID, { name: 'product_id', nullable: false })
  productId: string;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  @Field(() => Product, { nullable: false })
  product: Product;
}
