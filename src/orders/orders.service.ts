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
  EntityManager,
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
import { performance, PerformanceObserver } from 'node:perf_hooks';
import { cpuUsage } from 'node:process';
import { GraphQLError } from 'graphql/error';

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

  onModuleInit() {
    const obs = new PerformanceObserver((items) => {
      console.log(items.getEntries()[0].duration);
      performance.clearMarks();
    });
    obs.observe({ type: 'measure' });
  }

  async authorize(orderId: UUID, auditContext: AuditLog) {
    auditContext.action = 'authorize_payment';
    auditContext.targetType = 'order';
    auditContext.targetId = orderId;
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      const auditContextDetails = {
        ...auditContext,
        outcome: 'failure',
        reason: 'Order not found',
        statusCode: HttpStatus.NOT_FOUND.toString(),
        log: 'Order not found',
      };
      await this.auditLogRepository.insert(auditContextDetails);
      throw new HttpException('Order not found', HttpStatus.NOT_FOUND);
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

      return paymentData;
    } catch (error) {
      console.log(error);
      const auditContextDetails = {
        ...auditContext,
        outcome: 'failure',
        reason: (error as Error).message,
        statusCode: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
        log: JSON.stringify({ cause: { stack: (error as Error)?.stack } }),
      };
      await this.auditLogRepository.insert(auditContextDetails);
      throw new HttpException(
        'Payment not authorized',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getPaymentStatus(paymentId: UUID) {
    return await firstValueFrom(
      this.paymentsGrpcClient.getPaymentStatus({ paymentId }),
    );
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
        const res = this.rabbitmqService.publishToExchange(
          exchanges[queues.ORDERS_PROCESS_QUEUE],
          message,
          { correlationId: createdOrder.id, messageId: createdOrder.id },
        );
        console.log('message was sent', res);
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

  async updateOrderStatus(
    orderId: UUID,
    status: ORDER_STATUS,
    messageId: UUID,
  ) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new HttpException(
        `There is no order with id ${orderId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const message = await this.processedMessageRepository.findOneBy({
      id: messageId,
    });
    if (message) return;
    await this.datasource.transaction(async (manager: EntityManager) => {
      await manager
        .getRepository(Order)
        .update({ id: orderId }, { orderStatus: status });
      await manager
        .getRepository(ProcessedMessage)
        .upsert({ messageId, orderId, handler: status }, ['orderId']);
    });
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
        console.log(err);
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
        console.log(err);
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
    const correlationId = Math.random().toString(36).slice(2, 8);
    const startUsage = cpuUsage();
    performance.mark(`ordersFiltered:start:${correlationId}`);
    const memoryUsageBefore = process.memoryUsage().heapUsed;
    const memoryUsageTotalBefore = process.memoryUsage().heapTotal;

    if (this.limitFirst !== ordersPaginationInput.limit) {
      console.log('Limit was changed, we have to reload pages from 0');
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
    console.log(pageResult);

    performance.mark(`ordersFiltered:finished:${correlationId}`);
    const performanceInfo = performance.measure(
      `ordersFiltered:start:${correlationId} to ordersFiltered:finished:${correlationId}`,
      `ordersFiltered:start:${correlationId}`,
      `ordersFiltered:finished:${correlationId}`,
    );
    console.log('My performance duration: ', performanceInfo.duration);
    const endUsage = cpuUsage(startUsage);
    console.log('CPU usage user: ', endUsage.user, 'µs');
    console.log('CPU usage system: ', endUsage.system, 'ms');
    const memoryUsageAfter = process.memoryUsage().heapUsed;
    const memoryUsageTotalAfter = process.memoryUsage().heapTotal;
    const memoryUsage = memoryUsageAfter - memoryUsageBefore;
    const memoryUsageTotal = memoryUsageTotalAfter - memoryUsageTotalBefore;
    console.log('Memory usage: ', memoryUsage, 'bytes');
    console.log('Memory usage total: ', memoryUsageTotal, 'bytes');

    return pageResult;
  }
}
