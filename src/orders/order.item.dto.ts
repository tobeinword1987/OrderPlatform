import { Product } from "src/products/product.dto";
import { Order } from "./order.dto";

export type OrderItem = {
  quantity: number;
  orderId: string;
  order: Order;
  productId: string;
  product: Product;
}
