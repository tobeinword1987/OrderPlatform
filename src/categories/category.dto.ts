import { Product } from "src/products/product.dto";

export class Category {
  id: string;
  name: string;
  products: Product[];
}
