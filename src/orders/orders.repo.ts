import { Order } from './order.entity';
import { Product } from 'src/products/product.entity';
import { OrderItem } from './order.item.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewOrderReq } from './order.dto';
import { DataSource } from 'typeorm';

@Injectable()
export class OrderDB {
  constructor(private dataSource: DataSource) { }
  async createOrder(order: NewOrderReq) {
    return await this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const orderItemRepository = manager.getRepository(OrderItem);
      const productRepository = manager.getRepository(Product);

      const user = await orderRepository.findOneBy({ userId: order.userId });
      if (!user) {
        throw new HttpException(
          {
            message: 'User was not found',
            userId: order.userId,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const orderExist = await orderRepository.findOneBy({
        idempotencyKey: order.idempotencyKey,
      });
      console.log(orderExist);
      if (orderExist) {
        console.log('sequential')
        return orderExist;
      }
      // This is made for testing unique concurrency race, it can be commented
      await new Promise((r) => setTimeout(r, 500));

      let newOrder: Order;
      try {
        newOrder = await orderRepository.save({
          userId: order.userId,
          deliveryAddress: order.deliveryAddress,
          idempotencyKey: order.idempotencyKey,
        });
      } catch (error) {
        if (!error.message.includes('duplicate key value violates unique constraint')) {
          throw new Error(error)
        }
        console.log('parallel')

        return await this.dataSource.getRepository(Order).findOneBy({
          idempotencyKey: order.idempotencyKey,
        });
      }
      const newOrders: OrderItem[] = [];

      await Promise.all(
        order.products.map(async (product) => {
          const productDb = await productRepository.findOne({
            where: { id: product.productId },
            lock: { mode: 'pessimistic_write' },
          });

          if (!productDb) {
            throw new HttpException(
              {
                message: 'Product was not found in stock',
                productId: product.productId,
              },
              HttpStatus.NOT_FOUND,
            );
          }
          const rest = productDb.quantity - product.quantity;

          if (rest < 0) {
            throw new HttpException(
              {
                message: 'There is not enough products in the stock.',
                productId: productDb.id,
                name: productDb.name,
                quantity: productDb.quantity,
              },
              HttpStatus.BAD_REQUEST,
              {
                cause: {
                  id: productDb.id,
                  name: productDb.name,
                },
              },
            );
          }

          await productRepository.update(
            { id: product.productId },
            { quantity: rest },
          );
          newOrders.push(
            orderItemRepository.create({
              orderId: newOrder.id,
              priceAtPurchase: productDb.price,
              productId: product.productId,
              quantity: product.quantity,
            }),
          );
        }),
      );

      await orderItemRepository.insert(newOrders);
      const createdOrder = await orderRepository.findOne({
        where: { id: newOrder.id },
        relations: ['user', 'orderItems'],
      });
      return createdOrder;
    });
  }
}
