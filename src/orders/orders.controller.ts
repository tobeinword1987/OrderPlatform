import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { OrdersService } from './orders.service';
import { Roles } from '../../src/decorators/roles.decorator';
import type { UUID } from 'crypto';
import type { PaymentData } from './payments.grpc.client';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { AuditLog } from '../auditLogs/auditLog.entity';

@Controller('orders')
export class OrdersController {
  constructor(public ordersService: OrdersService) {}

  @Roles(['admin', 'user'])
  @Post()
  async createOrder(
    @Req() req: Request & { user: User },
    @Body() order: NewOrderReq,
  ) {
    const auditContext = {
      correlationId: req.headers['correlation-id'] as string,
      actorId: req.user?.id,
    };

    const orders = this.ordersService.createOrder(
      order,
      auditContext as AuditLog,
    );
    return orders;
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: {} })
  @Roles(['admin', 'user'])
  @Post('authorize')
  async authorize(
    @Req() req: Request & { user: User },
    @Body('orderId') orderId: UUID,
  ): Promise<PaymentData> {
    const auditContext = {
      correlationId: req.headers['correlation-id'] as string,
      actorId: req.user?.id,
    };
    return await this.ordersService.authorize(
      orderId,
      auditContext as AuditLog,
    );
  }

  @Roles(['admin', 'user'])
  @Post('paymentStatus')
  async getPaymentStatus(
    @Body('paymentId') paymentId: UUID,
  ): Promise<PaymentData> {
    return await this.ordersService.getPaymentStatus(paymentId);
  }
}
