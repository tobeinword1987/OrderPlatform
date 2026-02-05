import PostgresDataSource from 'data.source';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { OrderItem } from '../orders/order.item.entity';

type SeedUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  address: string;
  phoneNumber: string;
  postCode: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
};

type SeedOrder = {
  id: string;
  idempotencyKey: string;
  deliveryAddress: string;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
};

type SeedCategory = {
  id: string;
  name: string;
};

type SeedProduct = {
  id: string;
  name: string;
  categoryId: string;
  price: number;
  quantity: number;
};

type SeedOrderItem = {
  quantity: number;
  orderId: string;
  priceAtPurchase: number;
  productId: string;
};

const users: SeedUser[] = [
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
    firstName: 'Liudmyla',
    lastName: 'Popova',
    email: 'liudmyla.popova@icloud.com',
    address:
      'Ukraine, Cherkasy, Taraskova street, building 10, loc. 166, 85-796',
    phoneNumber: '43-00-24',
    postCode: '85-796',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5a2',
    firstName: 'Gorbatko',
    lastName: 'Ivan',
    email: 'gorbatko.ivan@icloud.com',
    address:
      'Ukraine, Cherkasy, Taraskova street, building 11, loc. 11, 85-796',
    phoneNumber: '43-00-24',
    postCode: '85-796',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5a3',
    firstName: 'Kosinova',
    lastName: 'Oksana',
    email: 'kosinova.oksana@icloud.com',
    address:
      'Ukraine, Cherkasy, Taraskova street, building 12, loc. 12, 85-796',
    phoneNumber: '43-00-24',
    postCode: '85-796',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const categories: SeedCategory[] = [
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5b1',
    name: 'dairy',
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5b2',
    name: 'meat',
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5b3',
    name: 'bread',
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5b4',
    name: 'grocery',
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5b5',
    name: 'chemicals',
  },
];

const products: SeedProduct[] = [
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d1',
    name: 'pizza',
    price: 8,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b3',
    quantity: 50,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d2',
    name: 'rye bread',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b3',
    quantity: 10,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d3',
    name: 'wheat bread',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b3',
    quantity: 10,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d4',
    name: 'butter',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b1',
    quantity: 10,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d5',
    name: 'sour cream',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b1',
    quantity: 10,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d6',
    name: 'milk',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b1',
    quantity: 10,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d7',
    name: 'bella',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b5',
    quantity: 10,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d8',
    name: 'colgate',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b5',
    quantity: 10,
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5d9',
    name: 'ariel',
    price: 12.5,
    categoryId: '0c6af838-fad5-4f6f-909d-d74886b1d5b5',
    quantity: 10,
  },
];

const orders: SeedOrder[] = [
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5e1',
    idempotencyKey: '100000',
    deliveryAddress:
      'Ukraine, Cherkasy, Taraskova street, building 12, loc. 12, 85-796',
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a3',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5e2',
    idempotencyKey: '100001',
    deliveryAddress:
      'Ukraine, Cherkasy, Taraskova street, building 11, loc. 11, 85-796',
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a2',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5e3',
    idempotencyKey: '100003',
    deliveryAddress:
      'Ukraine, Cherkasy, Taraskova street, building 10, loc. 166, 85-796',
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const orderItems: SeedOrderItem[] = [
  {
    quantity: 2,
    orderId: '0c6af838-fad5-4f6f-909d-d74886b1d5e2',
    priceAtPurchase: 12,
    productId: '0c6af838-fad5-4f6f-909d-d74886b1d5d6',
  },
  {
    quantity: 1,
    orderId: '0c6af838-fad5-4f6f-909d-d74886b1d5e3',
    priceAtPurchase: 13,
    productId: '0c6af838-fad5-4f6f-909d-d74886b1d5d2',
  },
];

async function seed() {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Seeding is disabled in production');
  }

  await PostgresDataSource.initialize();

  try {
    const usersRepository = PostgresDataSource.getRepository(User);
    const productRepository = PostgresDataSource.getRepository(Product);
    const orderRepository = PostgresDataSource.getRepository(Order);
    const categoryRepository = PostgresDataSource.getRepository(Category);
    const orderItemRepository = PostgresDataSource.getRepository(OrderItem);

    await usersRepository.upsert(users, ['id']);
    await categoryRepository.upsert(categories, ['id']);
    await productRepository.upsert(products, ['id']);
    await orderRepository.upsert(orders, ['id']);
    await orderItemRepository.upsert(orderItems, ['id']);
  } finally {
    await PostgresDataSource.destroy();
  }
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
