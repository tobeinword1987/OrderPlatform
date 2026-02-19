import { Context, Parent, Query, ResolveField } from "@nestjs/graphql";
import { Resolver } from "@nestjs/graphql";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { OrderItem } from "src/orders/order.item.entity";
import { Product } from "src/products/product.entity";
import { Repository } from "typeorm";

@Resolver(() => OrderItem)
export class OrderItemResolver {

    constructor(
        @InjectRepository(Product) private productRepository: Repository<OrderItem>,
    ) { }

    @ResolveField(() => Product)
    async product(
        @Context('loaders') loaders: {
            getOptimizedProducts: DataLoader<string, OrderItem, string>
        },
        @Context('strategy') strategy: string,
        @Parent() orderItem: OrderItem) {
        const { productId } = orderItem;
        if (strategy !== 'optimized') {
            console.log('---NAIVE---Request to Product table')
            return this.productRepository.findOne({ where: { id: productId } });
        }
        return loaders.getOptimizedProducts.load(productId)
    }
}
