import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Product } from '../products/product.entity';
import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
@ObjectType()
export class Category {
  @PrimaryGeneratedColumn('uuid')
  @Field(() => ID, { nullable: false })
  id: string;

  @Column()
  @Field(() => String, { nullable: false })
  name: string;

  @OneToMany(() => Product, (product) => product.category)
  @Field(() => [Product], { nullable: false })
  products: Product[];
}
