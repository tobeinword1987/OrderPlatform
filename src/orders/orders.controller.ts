import { Body, Controller, Get, Post } from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { OrdersService } from './orders.service';
import { Roles } from 'src/decorators/roles.decorator';
import type { UUID } from 'crypto';
import type { PaymentData } from './payments.grpc.client';

@Controller('orders')
export class OrdersController {
  constructor(public ordersService: OrdersService) {}

  @Roles(['admin', 'user'])
  @Post()
  async createOrder(@Body() order: NewOrderReq) {
    const orders = this.ordersService.createOrder(order);
    return orders;
  }

  @Roles(['admin', 'user'])
  @Post('authorize')
  async authorize(@Body('orderId') orderId: UUID): Promise<PaymentData> {
    return await this.ordersService.authorize(orderId);
  }

  @Roles(['admin', 'user'])
  @Get('paymentStatus')
  async getPaymentStatus(@Body('paymentId') paymentId: UUID): Promise<PaymentData> {
    return await this.ordersService.getPaymentStatus(paymentId);
  }
}
