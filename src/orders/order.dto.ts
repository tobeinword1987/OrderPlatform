import { User } from "src/users/user.dto";
import { OrderItem } from "./order.item.dto";


export class Order {
  idempotencyKey: string;
  deliveryAddress: string;
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
