import { Body, Controller, ForbiddenException, Post, Res } from '@nestjs/common';
import { NewOrderReq, Order } from './order.dto';
import { OrdersService } from './orders.service';

@Controller('orders')
export class OrdersController {

    constructor(public ordersService: OrdersService) {}

    @Post()
    async createOrder(@Body() order: NewOrderReq) {
        const orders = this.ordersService.createOrder(order);
        return orders;
    }
  }
