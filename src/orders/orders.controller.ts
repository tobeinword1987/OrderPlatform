import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { OrdersService } from './orders.service';
import { Roles } from '../../src/decorators/roles.decorator';
import type { UUID } from 'crypto';
import type { PaymentData } from './payments.grpc.client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Controller('orders')
export class OrdersController {
  constructor(public ordersService: OrdersService) {}

  @Roles(['admin', 'user'])
  @Post()
  async createOrder(@Body() order: NewOrderReq) {
    const orders = this.ordersService.createOrder(order);
    return orders;
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: {} })
  @Roles(['admin', 'user'])
  @Post('authorize')
  async authorize(@Body('orderId') orderId: UUID): Promise<PaymentData> {
    return await this.ordersService.authorize(orderId);
  }

  @Roles(['admin', 'user'])
  @Get('paymentStatus')
  async getPaymentStatus(
    @Body('paymentId') paymentId: UUID,
  ): Promise<PaymentData> {
    return await this.ordersService.getPaymentStatus(paymentId);
  }
}
