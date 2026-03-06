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
import { RabbitmqModule } from 'src/rabbitmq/rabbitmq.module';
import { OrdersWorkerService } from './orders.worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem, User, Product, UsersRoles, Role]), RabbitmqModule,
  ClientsModule.register([
    {
      name: 'OrdersService',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://user1:pass1@localhost:5673'],
        queue: 'orders.process',
        queueOptions: {
          durable: false
        },
      },
    },
  ]),
  ],
  providers: [
    OrderResolver,
    OrderItemResolver,
    OrdersService,
    OrdersWorkerService,
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
