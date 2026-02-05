import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { OrderDB } from './orders.repo';
import { DataSource } from 'typeorm';

@Injectable()
export class OrdersService {
  constructor(private orderDb: OrderDB) {}

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
}
