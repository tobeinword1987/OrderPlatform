import { Body, Controller, Delete, Post, Req, UseGuards } from '@nestjs/common';
import {
  NewOrderReq,
  DeleteOrderDto,
  AuthorizeOrderDto,
  GetPaymentStatusDto,
  Order,
} from './order.dto';
import { OrdersService } from './orders.service';
import { Roles } from '../../src/decorators/roles.decorator';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';
import { User } from '../users/user.entity';
import { AuditLog } from '../auditLogs/auditLog.entity';
import { ApiBearerAuth, ApiResponse } from '@nestjs/swagger';
import { PaymentData } from './payment.grpc.client.dto';
import { Order as OrderEntity } from './order.entity';

@ApiBearerAuth()
@Controller('orders')
export class OrdersController {
  constructor(public ordersService: OrdersService) {}

  @Roles(['admin', 'user'])
  @Post()
  @ApiResponse({
    status: 201,
    description: 'The order was successfully created.',
    type: Order || OrderEntity,
  })
  @ApiResponse({ status: 400, description: 'The should be a body.' })
  @ApiResponse({ status: 404, description: 'User was not found' })
  @ApiResponse({ status: 404, description: "Product wasn't found in stock" })
  @ApiResponse({
    status: 400,
    description: 'There is not enough products in the stock',
  })
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

  @Roles(['admin'])
  @Delete()
  @ApiResponse({ status: 400, description: 'The should be a body' })
  async deleteOrder(
    @Req() req: Request & { user: User },
    @Body() body: DeleteOrderDto,
  ) {
    const auditContext = {
      correlationId: req.headers['correlation-id'] as string,
      actorId: req.user?.id,
    };

    const deletedOrder = this.ordersService.deleteOrder(
      body.id,
      auditContext as AuditLog,
    );
    return deletedOrder;
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: {} })
  @Roles(['admin', 'user'])
  @Post('authorize')
  @ApiResponse({ status: 404, description: 'Order was not found' })
  async authorize(
    @Req() req: Request & { user: User },
    @Body() body: AuthorizeOrderDto,
  ): Promise<PaymentData> {
    const auditContext = {
      correlationId: req.headers['correlation-id'] as string,
      actorId: req.user?.id,
    };
    return await this.ordersService.authorize(
      body.orderId,
      auditContext as AuditLog,
    );
  }

  @Roles(['admin', 'user'])
  @Post('paymentStatus')
  @ApiResponse({
    status: 200,
    description: 'Payment status retrieved',
    type: PaymentData,
  })
  @ApiResponse({ status: 404, description: 'Payment was not found' })
  async getPaymentStatus(
    @Body() body: GetPaymentStatusDto,
  ): Promise<PaymentData> {
    return await this.ordersService.getPaymentStatus(body.paymentId);
  }
}
