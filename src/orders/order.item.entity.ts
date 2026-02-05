import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Order } from './order.entity';
import { Product } from '../products/product.entity';

@Entity()
@Index('Index_order_item_order_id', ['orderId'])
@Index('Index_order_item_product_id', ['productId'])
export class OrderItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  quantity: number;

  @Column({ type: 'float', name: 'price_at_purchase' })
  priceAtPurchase: number;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.orderItems, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'order_id' })
  order: Order;

  @Column({ type: 'uuid', name: 'product_id' })
  productId: string;

  @ManyToOne(() => Product, (product) => product.orderItems)
  @JoinColumn({ name: 'product_id' })
  product: Product;
}
