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
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { UsersRoles } from 'src/users/usersRoles.entity';
import { Role } from 'src/users/role.entity';
import { GqlAuthGuard } from 'src/auth/gql.jwt-auth.guard';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Product, UsersRoles, Role])],
  providers: [
    OrderResolver,
    OrderItemResolver,
    OrdersService,
    OrderDB,
    Repository<Order>,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [OrdersController],
  exports: [OrderResolver, OrderItemResolver, OrderDB]
})
export class OrdersModule { }
