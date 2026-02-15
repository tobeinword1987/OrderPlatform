import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
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
        let orderItems = await this.orderItemRepository
            .createQueryBuilder()
            .where("order_id IN (:...orderIds)", { orderIds: orderIds })
            .getMany()

        const orderItemsByOrderIds = new Map(orderItems.map(orderItem => [orderItem.orderId, orderItem]));

        const orderIts = orderIds.map(orderId => orderItemsByOrderIds.get(orderId))

        console.log('---OPTIMIZED---Request to OrderItem table')

        const result: OrderItem[][] = [];

        orderIds.forEach(id => {
            const oi = orderIts.filter(orderItem => orderItem?.orderId === id) as OrderItem[]
            result.push(oi);
        })

        return result;
    }

    async getOptimizedUsers(userIds: string[]) {
        const users = await this.userRepository
            .createQueryBuilder()
            .where("id IN (:...userIds)", { userIds: userIds })
            .getMany()

        const usersByIds = new Map(users.map(user => [user.id, user]));

        console.log('---OPTIMIZED---Request to User table')

        return userIds.map(userId => usersByIds.get(userId) ?? null)
    }

    async getOptimizedProducts(orderItemsIds: string[]) {
        const products = await this.productRepository
            .createQueryBuilder()
            .where("id IN (:...orderItemsIds)", { orderItemsIds: orderItemsIds })
            .getMany()

        const productsByIds = new Map(products.map(product => [product.id, product]));

        console.log('---OPTIMIZED---Request to Product table')

        return orderItemsIds.map(orderItemsId => productsByIds.get(orderItemsId) ?? null)
    }
}
