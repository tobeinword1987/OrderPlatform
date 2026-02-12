import { Context, Parent, Query, ResolveField } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import { Order } from "src/orders/order.entity";
import { OrderItem } from "src/orders/order.item.entity";
import { User } from "src/users/user.entity";
import { Repository } from "typeorm";
import DataLoader from "dataloader";

@Resolver(() => Order)
export class OrderResolver {

    constructor(
        @InjectRepository(Order) private orderRepository: Repository<Order>,
        @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(User) private userRepository: Repository<User>,
    ) { }

    @Query(() => [Order])
    async orders(@Context('strategy') strategy: string): Promise<Order[]> {
        const orders = await this.orderRepository.find({
            relations: ['orderItems', 'user']
        })

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
