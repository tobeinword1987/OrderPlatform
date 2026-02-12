import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Product } from '../products/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID!)
  id: string;

  @Column()
  @Field(() => String!)
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  @Field(() => [Product]!)
  products: Product[];
}
