import { Order } from './order.entity';
import { Product } from '../products/product.entity';
import { OrderItem } from './order.item.entity';
import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { NewOrderReq, ORDER_STATUS } from './order.dto';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { AuditLog } from '../auditLogs/auditLog.entity';
import { UUID } from 'crypto';
import { ProcessedMessage } from './processed.message.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class OrderDB {
  constructor(
    private dataSource: DataSource,
    @InjectRepository(Order) private orderRepository: Repository<Order>,
    @InjectRepository(ProcessedMessage)
    private processedMessageRepository: Repository<ProcessedMessage>,
  ) {}

  async deleteOrder(orderId: UUID, auditContext: AuditLog) {
    auditContext.action = 'delete_order';
    auditContext.targetType = 'order';
    auditContext.log = 'Order deleted successfully';
    auditContext.targetId = orderId;

    return await this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const auditLogRepository = manager.getRepository(AuditLog);
      if (!orderId) {
        const errorMessage = 'There should be body';
        const auditContextDetails = {
          ...auditContext,
          outcome: 'failure',
          reason: errorMessage,
          statusCode: HttpStatus.BAD_REQUEST.toString(),
          log: errorMessage,
        };
        await auditLogRepository.insert(auditContextDetails);
        throw new HttpException('There should be body', HttpStatus.BAD_REQUEST);
      }
      const order = await orderRepository.findOneBy({ id: orderId });
      if (!order) {
        const errorMessage = 'Order was not found';
        throw new HttpException(errorMessage, HttpStatus.NOT_FOUND);
      }
      try {
        const deletedOrder = await orderRepository.remove(order);

        const auditContextDetails = {
          ...auditContext,
          outcome: 'success',
          reason: 'Order deleted successfully',
          statusCode: HttpStatus.OK.toString(),
          log: 'Order deleted successfully',
        };
        await auditLogRepository.insert(auditContextDetails);

        return deletedOrder;
      } catch (err) {
        const errorMessage = 'Order was not deleted';
        const auditContextDetails = {
          ...auditContext,
          outcome: 'failure',
          reason: errorMessage,
          statusCode: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
          log: JSON.stringify({
            cause: {
              errorType: (err as Error)?.name,
              errorMessage: (err as Error)?.message,
            },
          }),
        };
        await auditLogRepository.insert(auditContextDetails);
        throw new HttpException(
          {
            message: 'Order was not deleted',
            orderId,
          },
          HttpStatus.INTERNAL_SERVER_ERROR,
        );
      }
    });
  }

  async createOrder(order: NewOrderReq, auditContext: AuditLog) {
    let totalPriceAtPurchase = 0;
    return await this.dataSource.transaction(async (manager) => {
      const orderRepository = manager.getRepository(Order);
      const orderItemRepository = manager.getRepository(OrderItem);
      const productRepository = manager.getRepository(Product);
      const userRepository = manager.getRepository(User);
      const auditLogRepository = manager.getRepository(AuditLog);
      const user = await userRepository.findOneBy({ id: order.userId });
      if (!user) {
        const errorMessage = 'User was not found';
        const auditContextDetails = {
          ...auditContext,
          outcome: 'failure',
          reason: errorMessage,
          statusCode: HttpStatus.NOT_FOUND.toString(),
          log: JSON.stringify({ cause: { userId: order.userId } }),
        };
        await auditLogRepository.insert(auditContextDetails);
        throw new HttpException(
          {
            message: errorMessage,
            userId: order.userId,
          },
          HttpStatus.NOT_FOUND,
        );
      }

      const orderExist = await orderRepository.findOneBy({
        idempotencyKey: order.idempotencyKey,
      });
      if (orderExist) {
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
      } catch (err: any) {
        const error = err as { message: string };
        if (
          error.message &&
          !error.message.includes(
            'duplicate key value violates unique constraint',
          )
        ) {
          const auditContextDetails = {
            ...auditContext,
            outcome: 'failure',
            reason: error.message,
            statusCode: HttpStatus.INTERNAL_SERVER_ERROR.toString(),
            log: JSON.stringify({ cause: { stack: (err as Error)?.stack } }),
          };
          await auditLogRepository.insert(auditContextDetails);
          throw new Error((err as Error)?.stack ?? String(err));
        }

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
            const errorMessage = 'Product was not found in stock';
            const auditContextDetails = {
              ...auditContext,
              outcome: 'failure',
              reason: errorMessage,
              statusCode: HttpStatus.NOT_FOUND.toString(),
              log: JSON.stringify({ cause: { productId: product.productId } }),
            };
            await auditLogRepository.insert(auditContextDetails);
            throw new HttpException(
              {
                message: errorMessage,
                productId: product.productId,
              },
              HttpStatus.NOT_FOUND,
            );
          }
          const rest = productDb.quantity - product.quantity;
          totalPriceAtPurchase =
            totalPriceAtPurchase + productDb.price * product.quantity;

          if (rest < 0) {
            const errorMessage = 'There is not enough products in the stock';
            const auditContextDetails = {
              ...auditContext,
              outcome: 'failure',
              reason: errorMessage,
              statusCode: HttpStatus.BAD_REQUEST.toString(),
              log: JSON.stringify({
                cause: { id: productDb.id, name: productDb.name },
              }),
            };
            await auditLogRepository.insert(auditContextDetails);
            throw new HttpException(
              {
                message: errorMessage,
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

      await orderRepository.update(
        { id: newOrder.id },
        { totalPriceAtPurchase },
      );
      const createdOrder = await orderRepository.findOne({
        where: { id: newOrder.id },
        relations: ['user', 'orderItems'],
      });
      const auditContextDetails = {
        ...auditContext,
        targetId: createdOrder?.id ?? '',
        outcome: 'success',
        reason: 'Order created successfully',
        statusCode: HttpStatus.CREATED.toString(),
        log: 'Order created successfully',
      };
      await auditLogRepository.insert(auditContextDetails);
      return createdOrder;
    });
  }

  async getOrdersByUserId(id: string) {
    try {
      const userOrders = await this.dataSource
        .createQueryBuilder(Order, 'order')
        .leftJoinAndSelect('order.user', 'user')
        .where('order.user_id = :id', { id })
        .andWhere('user.address = :address', {
          address:
            'Ukraine, Cherkasy, Taraskova street, building 10, loc. 166, 85-796',
        })
        .getMany();

      return userOrders;
    } catch (error) {
      throw new Error((error as Error)?.stack ?? String(error));
    }
  }

  async updateOrderStatus(
    orderId: UUID,
    status: ORDER_STATUS,
    messageId?: UUID,
  ) {
    const order = await this.orderRepository.findOneBy({ id: orderId });
    if (!order) {
      throw new HttpException(
        `There is no order with id ${orderId}`,
        HttpStatus.NOT_FOUND,
      );
    }
    const message = await this.processedMessageRepository.findOneBy({
      id: messageId,
    });
    if (message && messageId) return;
    await this.dataSource.transaction(async (manager: EntityManager) => {
      await manager
        .getRepository(Order)
        .update({ id: orderId }, { orderStatus: status });
      if (messageId) {
        await manager
          .getRepository(ProcessedMessage)
          .upsert({ messageId, orderId, handler: status }, ['orderId']);
      }
    });
  }
}
