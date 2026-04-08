import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import {
  RabbitmqService,
  exchanges,
  queues,
} from '../../src/rabbitmq/rabbitmq.service';
import { ORDER_STATUS, OrderProcessedMessage } from './order.dto';
import { Channel, ConsumeMessage } from 'amqplib';
import { OrdersService } from './orders.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(
    private orderService: OrdersService,
    private rabbitmqService: RabbitmqService,
    private configService: ConfigService,
  ) {}

  async onApplicationBootstrap() {
    await this.rabbitmqService.consume(
      queues.ORDERS_PROCESS_QUEUE,
      this.handleMessage.bind(this),
      {
        noAck: false,
      },
    );
  }

  async handleMessage(msg: ConsumeMessage, ch: Channel): Promise<void> {
    const message = JSON.parse(msg.content.toString()) as OrderProcessedMessage;
    const orderId = message.orderId;
    try {
      if (
        this.configService.get('RABBITMQ_SIMULATE_CONSUME_ERRORS') === 'true'
      ) {
        throw new Error(`Simulated error when order status was updating`);
      }
      await this.orderService.updateOrderStatus(
        orderId,
        ORDER_STATUS.PROCEED,
        message.messageId,
      );
      ch.ack(msg);
    } catch (error) {
      console.log(error);
      message.attempt = message.attempt + 1;

      if (message.attempt > this.configService.get('RABBITMQ_MAX_ATTEMPTS')) {
        console.log('Limit of attempts are reached to the MAX value');
        ch.ack(msg);
        this.rabbitmqService.publishToExchange(
          exchanges[queues.ORDERS_DLQ_QUEUE],
          message,
          { correlationId: message.orderId, messageId: message.orderId },
        );
        return;
      }

      ch.ack(msg);
      this.rabbitmqService.publishToExchange(
        exchanges[queues.ORDERS_PROCESS_QUEUE],
        message,
        { correlationId: message.orderId, messageId: message.orderId },
      );
    }
  }
}
