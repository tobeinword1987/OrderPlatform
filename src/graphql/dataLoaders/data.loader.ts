import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { Order } from "src/orders/order.dto";
import { OrderItem } from "src/orders/order.item.entity";
import { Product } from "src/products/product.entity";
import { User } from "src/users/user.entity";
import { Repository } from "typeorm";

@Injectable()
export class DtLoader {
    constructor(
        @InjectRepository(OrderItem) private orderItemRepository: Repository<OrderItem>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(Product) private productRepository: Repository<Product>
    ) { }

    createLoaders() {
        return {
            getOptimizedOrderItems: new DataLoader(async (orderIds: string[]) => await this.getOptimizedOrderItems(orderIds)),
            getOptimizedUsers: new DataLoader(async (orderIds: string[]) => await this.getOptimizedUsers(orderIds)),
            getOptimizedProducts: new DataLoader(async (orderItemIds: string[]) => await this.getOptimizedProducts(orderItemIds))
        }
    }

    async getOptimizedOrderItems(orderIds: string[]) {
        const orderItems = await this.orderItemRepository
            .createQueryBuilder()
            .where("order_id IN (:...orderIds)", { orderIds: orderIds })
            .getMany()

            console.log('---OPTIMIZED---Request to OrderItem table')

            const result: OrderItem[][] = [];

            orderIds.forEach(id => {
                const oi = orderItems.filter(orderItem => orderItem.orderId === id)
                result.push(oi);
            })

            return result;
    }

    async getOptimizedUsers(userIds: string[]) {
        const users = await this.userRepository
            .createQueryBuilder()
            .where("id IN (:...userIds)", { userIds: userIds })
            .getMany()

            console.log('---OPTIMIZED---Request to User table')

            return users;
    }

    async getOptimizedProducts(orderItemsIds: string[]) {
        const users = await this.productRepository
            .createQueryBuilder()
            .where("id IN (:...orderItemsIds)", { orderItemsIds: orderItemsIds })
            .getMany()

            console.log('---OPTIMIZED---Request to Product table')

            return users;
    }

}
