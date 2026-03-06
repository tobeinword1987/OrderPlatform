import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NewOrderReq, ORDER_STATUS, OrderProcessedMessage } from './order.dto';
import { OrderDB } from './orders.repo';
import { OrdersFilterInput, OrdersPaginationInput, PageResult } from './order.types.graphql';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';
import { RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { UUID } from 'crypto';

@Injectable()
export class OrdersService {
  private limitFirst = 2;

  constructor(
    private orderDb: OrderDB,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    private rabbitmqService: RabbitmqService
  ) { }

  async createOrder(order: NewOrderReq) {
    try {
      if (!order) {
        throw new HttpException('There should be body', HttpStatus.BAD_REQUEST);
      }
      const createdOrder = await this.orderDb.createOrder(order);

      if (createdOrder) {
        const message: OrderProcessedMessage = {
          orderId: createdOrder.id,
          messageId: createdOrder.id,
          attempt: 0,
          createdAt: (new Date()).toISOString()
        }
        const res = this.rabbitmqService.publishToQueue('orders.process', message, { correlationId: createdOrder.id, messageId: createdOrder.id });
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

  async updateOrderStatus(orderId: UUID, status: ORDER_STATUS) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new HttpException(`There is no order with id ${orderId}`, HttpStatus.NOT_FOUND);
    }
    await this.orderRepository.update({ id: orderId }, { orderStatus: status })
  }

  async getOrdersByUserId(id: string) {
    try {
      const orders = await this.orderDb.getOrdersByUserId(id);
      if (!orders) {
        throw new HttpException('Orders were not found for the user', HttpStatus.NOT_FOUND);
      }
      return orders;
    } catch (err) {
      if (!(err instanceof HttpException)) {
        console.log(err);
        throw new InternalServerErrorException('Getting orders for the user failed');
      } else {
        throw err;
      }
    }
  }

  async ordersFiltered(filter: OrdersFilterInput, ordersPaginationInput: OrdersPaginationInput): Promise<PageResult> {
    if (this.limitFirst !== ordersPaginationInput.limit) {
      console.log('Limit was changed, we have to reload pages from 0');
      ordersPaginationInput.createdAt = undefined;
      this.limitFirst = ordersPaginationInput.limit;
    }

    const ordersSortedQb = this.orderRepository
      .createQueryBuilder()
      .where({ orderStatus: filter.status })
      .andWhere({ createdAt: MoreThan(filter.dateFrom ? filter.dateFrom : new Date(0)) })
      .andWhere({ createdAt: LessThan(filter.dateTo ? filter.dateTo : new Date()) })
      .orderBy('created_at', 'DESC')
      .addOrderBy('id', 'DESC')

    const cursor = ordersPaginationInput.createdAt;
    if (cursor) {
      ordersSortedQb.andWhere('(created_at, id) < (:createdAt, :id)', {
        createdAt: ordersPaginationInput.createdAt,
        id: ordersPaginationInput.idTieBreaker,
      });

    }

    const allFilteredOrders = await ordersSortedQb
      .getMany()

    const orders = await ordersSortedQb
      .take(ordersPaginationInput.limit)
      .getMany()

    const numberOfPages = Math.round(allFilteredOrders.length / this.limitFirst);

    const countOfPages = allFilteredOrders.length % this.limitFirst ? numberOfPages : numberOfPages + 1;
    const idTieBreaker = orders[orders.length - 1].id;
    const createdAt = orders[orders.length - 1].createdAt;

    const pageResult = {
      orders,
      countOfPages,
      cursor: {
        createdAt,
        idTieBreaker
      }
    }
    console.log(pageResult);

    return pageResult;
  }
}
