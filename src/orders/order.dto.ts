import { User } from 'src/users/user.dto';
import { OrderItem } from './order.item.dto';

export type OrdersFilterInput = {
  status?: ORDER_STATUS,
  dateFrom?:Date,
  dateTo?: Date
}

export type OrdersPaginationInput = {
  limit: number,
  offset: number
}

export enum ORDER_STATUS {
  CREATED = 'created',
  UPDATED = 'updated',
  IN_PROGRESS = 'in_progress',
  CLOSED = 'closed'
}

export class Order {
  idempotencyKey: string;
  deliveryAddress: string;
  orderStatus: ORDER_STATUS;
  customerId: string;
  user: User;
  orderItems: OrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export class Product {
  productId: string;
  quantity: number;
}

export class NewOrderReq {
  userId: string;
  idempotencyKey: string;
  deliveryAddress: string;
  products: Product[];
}
