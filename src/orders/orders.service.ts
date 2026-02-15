import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { OrderDB } from './orders.repo';
import { OrdersFilterInput, OrdersPaginationInput } from './order.types.graphql';
import { Order } from './order.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThan, Repository } from 'typeorm';

@Injectable()
export class OrdersService {
  private limitFirst = 2;

  constructor(
    private orderDb: OrderDB,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
  ) { }

  async createOrder(order: NewOrderReq) {
    try {
      if (!order) {
        throw new HttpException('There should be body', HttpStatus.BAD_REQUEST);
      }
      const createdOrder = await this.orderDb.createOrder(order);
      return createdOrder;
    } catch (err) {
      if (!(err instanceof HttpException)) {
        throw new InternalServerErrorException('Creating order failed');
      } else {
        throw err;
      }
    }
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

  async ordersFiltered(filter: OrdersFilterInput, ordersPaginationInput: OrdersPaginationInput): Promise<Order[]> {
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

    const orders = await ordersSortedQb
      .take(ordersPaginationInput.limit + 1)
      .getMany()

    const countOfPages = Math.floor(orders.length / this.limitFirst);
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

    return orders;
  }
}
