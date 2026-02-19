import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NewOrderReq, Order } from './order.dto';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(public ordersService: OrdersService) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async createOrder(@Body() order: NewOrderReq) {
    const orders = this.ordersService.createOrder(order);
    return orders;
  }
}
