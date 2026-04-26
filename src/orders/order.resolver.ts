import {
  Args,
  Context,
  Parent,
  Query,
  registerEnumType,
  ResolveField,
} from '@nestjs/graphql';
import { Resolver } from '@nestjs/graphql';
import { InjectRepository } from '@nestjs/typeorm';
import { Order } from '../../src/orders/order.entity';
import { OrderItem } from '../../src/orders/order.item.entity';
import { User } from '../../src/users/user.entity';
import { Repository } from 'typeorm';
import DataLoader from 'dataloader';
import { ORDER_STATUS } from './order.dto';
import {
  OrdersFilterInput,
  OrdersPaginationInput,
  PageResult,
} from '../../src/orders/order.types.graphql';
import { OrdersService } from '../../src/orders/orders.service';
import { Roles } from '../../src/decorators/roles.decorator';
import type { UUID } from 'crypto';

registerEnumType(ORDER_STATUS, { name: 'OrderStatus' });

@Resolver(() => Order)
export class OrderResolver {
  constructor(
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private orderService: OrdersService,
  ) {}

  @Query(() => [Order])
  @Roles(['user', 'admin'])
  async orders(): Promise<Order[]> {
    const orders = await this.orderRepository.find({
      relations: ['orderItems', 'user'],
    });
    return orders;
  }

  @Query(() => Order, { nullable: true })
  @Roles(['user', 'admin'])
  async orderById(@Args('id') id: UUID): Promise<Order> {
    return await this.orderService.getOrderById(id);
  }

  @Query(() => PageResult)
  @Roles(['user', 'admin'])
  async ordersFiltered(
    @Args('filter') filter: OrdersFilterInput,
    @Args('ordersPaginationInput') ordersPaginationInput: OrdersPaginationInput,
  ): Promise<PageResult> {
    return await this.orderService.ordersFiltered(
      filter,
      ordersPaginationInput,
    );
  }

  @ResolveField(() => [OrderItem])
  async orderItems(
    @Context('loaders')
    loaders: {
      getOptimizedOrderItems: DataLoader<string, OrderItem, string>;
    },
    @Context('strategy') strategy: string,
    @Parent() order: Order,
  ) {
    const { id } = order;
    if (strategy !== 'optimized') {
      console.log('---NAIVE---Request to OrderItem table');
      return await this.orderItemRepository.find({
        where: { orderId: id },
        relations: ['product'],
      });
    }
    return loaders.getOptimizedOrderItems.load(id);
  }

  @ResolveField(() => User)
  async user(
    @Context('loaders')
    loaders: {
      getOptimizedUsers: DataLoader<string, OrderItem, string>;
    },
    @Context('strategy') strategy: string,
    @Parent() order: Order,
  ) {
    const { userId } = order;
    if (strategy !== 'optimized') {
      console.log('---NAIVE---Request to User table');
      return await this.userRepository.findOneBy({ id: userId });
    }
    return loaders.getOptimizedUsers.load(userId);
  }
}
