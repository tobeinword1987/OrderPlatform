import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NewOrderReq, ORDER_STATUS, OrderProcessedMessage } from './order.dto';
import { OrderDB } from './orders.repo';
import {
  OrdersFilterInput,
  OrdersPaginationInput,
  PageResult,
} from './order.types.graphql';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import {
  DataSource,
  LessThan,
  MoreThan,
  Repository,
  TypeORMError,
} from 'typeorm';
import {
  exchanges,
  queues,
  RabbitmqService,
} from '../../src/rabbitmq/rabbitmq.service';
import { UUID } from 'crypto';
import { ProcessedMessage } from './processed.message.entity';
import { PaymentsGrpcClient } from './payments.grpc.client';
import { firstValueFrom } from 'rxjs';
import { AuditLog } from '../auditLogs/auditLog.entity';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class OrdersService {
  private limitFirst = 2;

  constructor(
    private orderDb: OrderDB,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(AuditLog)
    private auditLogRepository: Repository<AuditLog>,
    @InjectRepository(ProcessedMessage)
    private processedMessageRepository: Repository<ProcessedMessage>,
    private datasource: DataSource,
    private rabbitmqService: RabbitmqService,
    private paymentsGrpcClient: PaymentsGrpcClient,
  ) {}

  onModuleInit() {}

  async authorize(orderId: UUID, auditContext: AuditLog) {
    auditContext.action = 'authorize_payment';
    auditContext.targetType = 'order';
    auditContext.targetId = orderId;
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      const auditContextDetails = {
        ...auditContext,
        outcome: 'failure',
        reason: 'Order was not found',
        statusCode: HttpStatus.NOT_FOUND.toString(),
        log: 'Order was not found',
      };
      await this.auditLogRepository.insert(auditContextDetails);
      throw new HttpException('Order was not found', HttpStatus.NOT_FOUND);
    }

    try {
      const paymentData = await firstValueFrom(
        this.paymentsGrpcClient.authorize({
          orderId,
          amount: order.totalPriceAtPurchase,
          currency: 'pln',
          idempotencyKey: orderId,
        }),
      );

      const auditContextDetails = {
        ...auditContext,
        outcome: 'success',
        reason: 'Payment authorized successfully',
        statusCode: HttpStatus.OK.toString(),
        log: 'Payment authorized successfully',
      };
      await this.auditLogRepository.insert(auditContextDetails);

      await this.orderDb.updateOrderStatus(orderId, ORDER_STATUS.PAYED);

      return paymentData;
    } catch (error) {
      const auditContextDetails = {
        ...auditContext,
        outcome: 'failure',
        reason: (error as Error).message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
        log: JSON.stringify({ cause: { stack: (error as Error)?.stack } }),
      };
      await this.auditLogRepository.insert(auditContextDetails);
      throw new RpcException({
        details: 'Payment not authorized',
        code: HttpStatus.INTERNAL_SERVER_ERROR,
      });
    }
  }

  async getPaymentStatus(paymentId: UUID) {
    try {
      return await firstValueFrom(
        this.paymentsGrpcClient.getPaymentStatus({ paymentId }),
      );
    } catch (error) {
      throw new RpcException({
        details: (error as Error).message,
        code: HttpStatus.NOT_FOUND,
      });
    }
  }

  async createOrder(order: NewOrderReq, auditContext: AuditLog) {
    auditContext.action = 'create_order';
    auditContext.targetType = 'order';
    auditContext.log = 'Order created successfully';
    try {
      if (!order) {
        throw new HttpException('There should be body', HttpStatus.BAD_REQUEST);
      }
      const createdOrder = await this.orderDb.createOrder(order, auditContext);

      if (createdOrder) {
        const message: OrderProcessedMessage = {
          orderId: createdOrder.id,
          messageId: createdOrder.id,
          attempt: 0,
          createdAt: new Date().toISOString(),
        };
        this.rabbitmqService.publishToExchange(
          exchanges[queues.ORDERS_PROCESS_QUEUE],
          message,
          { correlationId: createdOrder.id, messageId: createdOrder.id },
        );
      }

      return createdOrder;
    } catch (err) {
      if (!(err instanceof HttpException)) {
        throw new InternalServerErrorException('Creating order failed');
      } else {
        throw err;
      }
    }
  }

  async deleteOrder(orderId: UUID, auditContext: AuditLog) {
    auditContext.action = 'delete_order';
    auditContext.targetType = 'order';
    auditContext.log = 'Order deleted successfully';
    try {
      if (!orderId) {
        throw new HttpException('There should be body', HttpStatus.BAD_REQUEST);
      }
      return await this.orderDb.deleteOrder(orderId, auditContext);
    } catch (err) {
      if (!(err instanceof HttpException)) {
        throw new InternalServerErrorException('Order deleting failed');
      } else {
        throw err;
      }
    }
  }

  async getOrdersByUserId(id: string) {
    try {
      const orders = await this.orderDb.getOrdersByUserId(id);
      if (!orders) {
        throw new HttpException(
          'Orders were not found for the user',
          HttpStatus.NOT_FOUND,
        );
      }
      return orders;
    } catch (err) {
      if (!(err instanceof HttpException)) {
        throw new InternalServerErrorException(
          'Getting orders for the user failed',
        );
      } else {
        throw err;
      }
    }
  }

  async getOrderById(id: UUID): Promise<Order> {
    try {
      const order = await this.orderRepository.findOneByOrFail({ id });
      return order;
    } catch (err) {
      if (!(err instanceof HttpException) && !(err instanceof TypeORMError)) {
        throw new InternalServerErrorException(
          'Getting orders for the user failed',
        );
      } else {
        throw new HttpException('Order was not found', HttpStatus.NOT_FOUND);
      }
    }
  }

  async ordersFiltered(
    filter: OrdersFilterInput,
    ordersPaginationInput: OrdersPaginationInput,
  ): Promise<PageResult> {
    if (this.limitFirst !== ordersPaginationInput.limit) {
      this.limitFirst = ordersPaginationInput.limit;
    }

    const ordersSortedQb = this.orderRepository
      .createQueryBuilder()
      .where({ orderStatus: filter.status })
      .andWhere({
        createdAt: MoreThan(filter.dateFrom ? filter.dateFrom : new Date(0)),
      })
      .andWhere({
        createdAt: LessThan(filter.dateTo ? filter.dateTo : new Date()),
      })
      .orderBy('created_at', 'DESC')
      .addOrderBy('id', 'DESC');

    const cursor = ordersPaginationInput.createdAt;
    if (cursor) {
      ordersSortedQb.andWhere('(created_at, id) < (:createdAt, :id)', {
        createdAt: ordersPaginationInput.createdAt,
        id: ordersPaginationInput.idTieBreaker,
      });
    }

    const allFilteredOrders = await ordersSortedQb.getCount();

    const orders = await ordersSortedQb
      .take(ordersPaginationInput.limit)
      .getMany();

    const numberOfPages = Math.ceil(allFilteredOrders / this.limitFirst);

    const countOfPages =
      allFilteredOrders % this.limitFirst ? numberOfPages : numberOfPages + 1;
    const idTieBreaker = orders[orders.length - 1].id;
    const createdAt = orders[orders.length - 1].createdAt;

    const pageResult = {
      orders,
      countOfPages,
      cursor: {
        createdAt,
        idTieBreaker,
      },
    };
    return pageResult;
  }
}
