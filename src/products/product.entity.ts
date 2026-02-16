import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Category } from '../categories/category.entity';
import { OrderItem } from '../orders/order.item.entity';
import {
  Column,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { OneToOne } from 'typeorm';

@Entity()
@ObjectType()
@Index('Index_product_price', ['price'])
@Index('Index_product_category_id', ['categoryId'])
export class Product {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column()
  @Field(() => String!)
  name: string;

  @Column({ type: 'uuid', name: 'category_id' })
  @Field(() => ID!, { name: 'category_id' })
  categoryId: string;

  @Column({ type: 'float' })
  @Field(() => Number!)
  price: number;

  @Column()
  @Field(() => Number!)
  quantity: number;

  @ManyToOne(() => Category, (category) => category.products, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'category_id' })
  @Field(() => Category!)
  category: Category;

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  @Field(() => [OrderItem]!)
  orderItems: OrderItem[];
}
