import { Args, ArgsType, Context, Field, ObjectType, Parent, Query, ResolveField } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/orders/order.entity";
import { OrderItem } from "src/orders/order.item.entity";
import { User } from "src/users/user.entity";
import { LessThan, MoreThan, Repository } from "typeorm";
import DataLoader from "dataloader";
import type { ORDER_STATUS } from "src/orders/order.dto";

@ArgsType()
class OrdersFilterInput {
  @Field()
  status?: ORDER_STATUS;

  @Field()
  dateFrom?: Date;

  @Field()
  dateTo?: Date;
}

@ArgsType()
class OrdersPaginationInput {
    @Field()
    limit: number;

    @Field()
    createdAt?: Date;

    @Field()
    idTieBreaker?: string;
}

@ObjectType()
@ArgsType()
class PageResult {

    orders: Order[];

    @Field()
    countOfPages: number;

    cursor: {
        createdAt: Date,
        idTieBreaker: string
    }
}

@Resolver(() => Order)
export class OrderResolver {

    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

   private limitFirst: number = 2;

    @Query(() => [Order])
    async orders(): Promise<Order[]> {
        const orders = await this.orderRepository.find({
            relations: ['orderItems', 'user']
        })

        return orders;
    }

    @Query(() => [Order])
    async ordersFiltered(@Args() filter: OrdersFilterInput, @Args() ordersPaginationInput: OrdersPaginationInput): Promise<Order[]> {
        if(this.limitFirst !== ordersPaginationInput.limit) {
            console.log('Limit was changed, we have to reload pages from 0');
            ordersPaginationInput.createdAt = undefined;
            this.limitFirst = ordersPaginationInput.limit;
        }

        const ordersSortedQb = this.orderRepository
            .createQueryBuilder()
            .where({ orderStatus: filter.status })
            .andWhere({ createdAt: MoreThan(filter.dateFrom ? filter.dateFrom : new Date(0)) })
            .andWhere({ createdAt: LessThan(filter.dateTo ? filter.dateTo : new Date()) })
            .orderBy('created_at', 'DESC')
            .addOrderBy('id', 'DESC')

        const cursor = ordersPaginationInput.createdAt;
        if (cursor) {
            ordersSortedQb.andWhere('(created_at, id) < (:createdAt, :id)', {
                createdAt: ordersPaginationInput.createdAt,
                id: ordersPaginationInput.idTieBreaker,
            });

        }

        const orders = await ordersSortedQb
            .take(ordersPaginationInput.limit + 1)
            .getMany()

        const countOfPages = Math.floor(orders.length / this.limitFirst);
        const idTieBreaker = orders[orders.length - 1].id;
        const createdAt = orders[orders.length - 1].createdAt;

        const pageResult = {
            orders,
            countOfPages,
            cursor: {
                createdAt,
                idTieBreaker
            }
        }
        console.log('~~~~~~~~~~~~~~@@@', pageResult);

        return orders;
    }

    @ResolveField(() => [OrderItem])
    async orderItems(
        @Context('loaders') loaders: {
            getOptimizedOrderItems: DataLoader<string, OrderItem, string>
        },
        @Context('strategy') strategy: string,
        @Parent() order: Order) {
        const { id } = order;
        if (strategy !== 'optimized') {
            console.log('---NAIVE---Request to OrderItem table')
            return await this.orderItemRepository.find({ where: { orderId: id }, relations: ['product'] })
        }
        return loaders.getOptimizedOrderItems.load(id)
    }

    @ResolveField(() => User)
    async user(
        @Context('loaders') loaders: {
            getOptimizedUsers: DataLoader<string, OrderItem, string>
        },
        @Context('strategy') strategy: string,
        @Parent() order: Order) {
        const { userId } = order;
        if (strategy !== 'optimized') {
            console.log('---NAIVE---Request to User table')
            return await this.userRepository.findOneBy({ id: userId } )
        }
        return loaders.getOptimizedUsers.load( userId )
    }
}
