import {
  HttpException,
  HttpStatus,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { OrderDB } from './orders.repo';

@Injectable()
export class OrdersService {
  constructor(private orderDb: OrderDB) { }

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
}
