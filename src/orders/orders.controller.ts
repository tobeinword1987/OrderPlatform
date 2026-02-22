import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { OrdersService } from './orders.service';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('orders')
export class OrdersController {
  constructor(public ordersService: OrdersService) {}

  @Roles(['admin', 'user'])
  @Post()
  async createOrder(@Body() order: NewOrderReq) {
    const orders = this.ordersService.createOrder(order);
    return orders;
  }
}
