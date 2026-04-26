import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitmqService, queues } from '../rabbitmq/rabbitmq.service';
import { ORDER_STATUS, OrderProcessedMessage } from './order.dto';
import { Channel, ConsumeMessage } from 'amqplib';
import { OrdersService } from './orders.service';

@Injectable()
export class OrdersWorkerFailed implements OnApplicationBootstrap {
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(
    private orderService: OrdersService,
    private rabbitmqService: RabbitmqService,
  ) {}

  async onApplicationBootstrap() {
    await this.rabbitmqService.consume(
      queues.ORDERS_DLQ_QUEUE,
      this.handleMessage.bind(this),
      {
        noAck: false,
      },
    );
  }

  async handleMessage(msg: ConsumeMessage, ch: Channel): Promise<void> {
    const message = JSON.parse(msg.content.toString()) as OrderProcessedMessage;
    const orderId = message.orderId;
    await this.orderService.updateOrderStatus(
      orderId,
      ORDER_STATUS.FAILED,
      message.messageId,
    );
    ch.ack(msg);
  }
}
