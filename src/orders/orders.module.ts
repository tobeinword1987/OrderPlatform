import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order.item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderDB } from './orders.repo';
import { OrderResolver } from './order.resolver';
import { OrderItemResolver } from './order.item.resolver';
import { User } from 'src/users/user.entity';
import { Product } from 'src/products/product.entity';
import { Repository } from 'typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Product])],
  providers: [OrderResolver, OrderItemResolver, OrdersService, OrderDB, Repository<Order>],
  controllers: [OrdersController],
  exports: [OrderResolver, OrderItemResolver, OrderDB]
})
export class OrdersModule {}
