import { randomUUID, UUID } from 'crypto';
import PostgresDataSource from 'data.source';
import { User } from '../users/user.entity';
import { Order } from '../orders/order.entity';
import { Product } from '../products/product.entity';
import { Category } from '../categories/category.entity';
import { OrderItem } from '../orders/order.item.entity';
import { Repository } from 'typeorm';
import { ORDER_STATUS } from '../../src/orders/order.dto';
import { Role } from '../../src/users/role.entity';
import { RolesToScopes } from '../../src/users/rolesToScopes.entity';
import { UsersRoles } from '../../src/users/usersRoles.entity';
import { Scope } from '../../src/users/scope.entity';
import { hashdata } from '../../src/utils/helper';

type SeedRole = {
  id: string;
  role: string;
};

type SeedScope = {
  id: string;
  scope: string;
};

type SeedUser = {
  id: string;
  login: string;
  password: string;
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
  orderStatus: ORDER_STATUS;
  userId: string;
  totalPriceAtPurchase: number;
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

const roles: SeedRole[] = [
  {
    id: 'e37a41b2-234a-41b1-b32b-ca251d1b0086',
    role: 'admin',
  },
  {
    id: 'e37a41b2-234a-41b1-b32b-ca251d1b0087',
    role: 'user',
  },
  {
    id: 'e37a41b2-234a-41b1-b32b-ca251d1b0085',
    role: 'guest',
  },
];

type SeedRoleToScope = {
  id: string;
  roleId: string;
  scopeId: string;
};

type SeedUserRoles = {
  id: string;
  roleId: string;
  userId: string;
};

const scopes: SeedScope[] = [
  {
    id: randomUUID(),
    scope: 'orders:read',
  },
  {
    id: randomUUID(),
    scope: 'orders:write',
  },
  {
    id: randomUUID(),
    scope: 'categories:read',
  },
  {
    id: randomUUID(),
    scope: 'categories:write',
  },
  {
    id: randomUUID(),
    scope: 'products:read',
  },
  {
    id: randomUUID(),
    scope: 'products:write',
  },
  {
    id: randomUUID(),
    scope: 'users:read',
  },
  {
    id: randomUUID(),
    scope: 'users:write',
  },
  {
    id: randomUUID(),
    scope: 'scopes:read',
  },
  {
    id: randomUUID(),
    scope: 'scopes:write',
  },
  {
    id: randomUUID(),
    scope: 'roles:read',
  },
  {
    id: randomUUID(),
    scope: 'roles:write',
  },
];

const roleToScope: SeedRoleToScope[] = [];
const roleToScopeIds: UUID[] = [];
for (let i = 0; i < scopes.length; i++) {
  roleToScopeIds.push(randomUUID());
  roleToScope.push(
    {
      id: randomUUID(),
      roleId: roles[0].id,
      scopeId: scopes[i].id,
    },
    {
      id: randomUUID(),
      roleId: roles[1].id,
      scopeId: scopes[i].id,
    },
    {
      id: randomUUID(),
      roleId: roles[2].id,
      scopeId: scopes[i].id,
    },
  );
}

const users: SeedUser[] = [
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
    login: 'login1',
    password: hashdata('password1'),
    firstName: 'Liudmyla',
    lastName: 'Popova',
    email: 'liudmyla.popova@icloud.com',
    address: 'Ukraine, Cherkasy, Tarask street, building 100, loc. 166, 85-796',
    phoneNumber: '43-66-24',
    postCode: '85-796',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5a2',
    login: 'login2',
    password: hashdata('password2'),
    firstName: 'Gorbatko',
    lastName: 'Ivan',
    email: 'gorbatko.ivan@icloud.com',
    address: 'Ukraine, Cherkasy, Taraask street, building 11, loc. 11, 85-796',
    phoneNumber: '43-66-24',
    postCode: '85-796',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5a3',
    login: 'login3',
    password: hashdata('password3'),
    firstName: 'Kosinova',
    lastName: 'Oksana',
    email: 'kosinova.oksana@icloud.com',
    address: 'Ukraine, Cherkasy, Taraask street, building 12, loc. 12, 85-796',
    phoneNumber: '43-66-24',
    postCode: '85-796',
    isActive: true,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];

const userRoles: SeedUserRoles[] = [];
const userRolesIds: UUID[] = [];
for (let i = 0; i < users.length; i++) {
  userRolesIds.push(randomUUID());
  userRoles.push({
    id: userRolesIds[i],
    roleId: 'e37a41b2-234a-41b1-b32b-ca251d1b0086',
    userId: users[i].id,
  });
}

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

const orders: SeedOrder[] = [];
const orderIds = [];
for (let i = 0; i < 6000; i++) {
  orderIds.push(randomUUID());
  orders.push({
    id: orderIds[i],
    idempotencyKey: Math.random().toString().slice(2),
    deliveryAddress:
      'Ukraine, Cherkasy, Taraask street, building 12, loc. 12, 85-796',
    orderStatus: ORDER_STATUS.CREATED,
    userId: users[Math.floor(Math.random() * 3)].id,
    totalPriceAtPurchase: 12.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

// for SQL ANALIZE TESTING
orders.push(
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5e1',
    idempotencyKey: '100000',
    deliveryAddress:
      'Ukraine, Cherkasy, Taraask street, building 12, loc. 12, 85-796',
    orderStatus: ORDER_STATUS.CREATED,
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
    totalPriceAtPurchase: 12.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5e2',
    idempotencyKey: '100001',
    deliveryAddress:
      'Ukraine, Cherkasy, Taraask street, building 11, loc. 11, 85-796',
    orderStatus: ORDER_STATUS.CREATED,
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a2',
    totalPriceAtPurchase: 12.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: '0c6af838-fad5-4f6f-909d-d74886b1d5e3',
    idempotencyKey: '100003',
    deliveryAddress:
      'Ukraine, Cherkasy, Taraask street, building 10, loc. 166, 85-796',
    orderStatus: ORDER_STATUS.CREATED,
    userId: '0c6af838-fad5-4f6f-909d-d74886b1d5a1',
    totalPriceAtPurchase: 12.5,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
);

const orderItems: SeedOrderItem[] = [];
for (let i = 0; i < 10000; i++) {
  orderItems.push({
    quantity: 2,
    orderId: orders[Math.floor(Math.random() * 5999)].id,
    priceAtPurchase: 12,
    productId: products[Math.floor(Math.random() * 9)].id,
  });
}

// for SQL ANALIZE TESTING
orderItems.push(
  {
    quantity: 2,
    orderId: '0c6af838-fad5-4f6f-909d-d74886b1d5e2',
    priceAtPurchase: 12,
    productId: products[Math.floor(Math.random() * 9)].id,
  },
  {
    quantity: 1,
    orderId: '0c6af838-fad5-4f6f-909d-d74886b1d5e3',
    priceAtPurchase: 13,
    productId: '0c6af838-fad5-4f6f-909d-d74886b1d5d2',
  },
);

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
    const roleRepository = PostgresDataSource.getRepository(Role);
    const scopeRepository = PostgresDataSource.getRepository(Scope);
    const rolesToScopesRepository =
      PostgresDataSource.getRepository(RolesToScopes);
    const usersRolesRepository = PostgresDataSource.getRepository(UsersRoles);

    const countUsers = await usersRepository.count();
    const countProducts = await productRepository.count();
    const countOrders = await orderRepository.count();
    const countCategories = await categoryRepository.count();
    const countOrderItems = await orderItemRepository.count();
    const countRoles = await roleRepository.count();
    const countScopes = await scopeRepository.count();
    const countRolesToScopes = await rolesToScopesRepository.count();
    const countUsersRoles = await usersRolesRepository.count();

    if (
      !(
        countUsers &&
        countProducts &&
        countOrders &&
        countCategories &&
        countOrderItems &&
        countRoles &&
        countScopes &&
        countRolesToScopes &&
        countUsersRoles
      )
    ) {
      await upsertBatchElements(usersRepository, users);
      await upsertBatchElements(categoryRepository, categories);
      await upsertBatchElements(productRepository, products);
      await upsertBatchElements(orderRepository, orders);
      await upsertBatchElements(orderItemRepository, orderItems);

      await upsertBatchElements(roleRepository, roles);
      await upsertBatchElements(scopeRepository, scopes);
      await upsertBatchElements(rolesToScopesRepository, roleToScope);
      await upsertBatchElements(usersRolesRepository, userRoles);
    }
  } finally {
    await PostgresDataSource.destroy();
  }
}

const upsertBatchElements = async (
  repository: Repository<any>,
  arr: Array<any>,
) => {
  let start = 0;
  let flag = 0;
  for (let i = 0; i < arr.length; i + 5000) {
    if (start + 5000 > arr.length) {
      flag = 1;
    }
    const limitArr = arr.slice(start, start + 5000);
    start = start + 5000;
    await repository.upsert(limitArr, ['id']);
    if (flag) {
      break;
    }
  }
};

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
