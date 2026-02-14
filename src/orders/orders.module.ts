import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order.item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderDB } from './orders.repo';

@Module({
  imports: [TypeOrmModule.forFeature([Order, OrderItem])],
  providers: [OrdersService, OrderDB],
  controllers: [OrdersController],
})
export class OrdersModule {}
