import { Category } from "src/categories/category.dto";
import { OrderItem } from "src/orders/order.item.dto";

export class Product {
  name: string;
  categoryId: string;
  price: number;
  quantity: number;
  category: Category;
  orderItems: OrderItem[];
}
