import { Injectable, Logger, OnApplicationBootstrap } from '@nestjs/common';
import { RabbitConsumeHandler, RabbitmqService } from 'src/rabbitmq/rabbitmq.service';
import { ORDER_STATUS } from './order.dto';
import { Channel, ConsumeMessage } from 'amqplib';
import { OrdersService } from './orders.service';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class OrdersWorkerService implements OnApplicationBootstrap {
  private readonly logger = new Logger(RabbitmqService.name);
  constructor(
    private rabbitmqService: RabbitmqService,
    private configService: ConfigService
  ) { }

  async onApplicationBootstrap() {
    await this.rabbitmqService.consume('orders.process', this.handleMessage.bind(this), {
      noAck: false
    })
  }

  async handleMessage(msg: ConsumeMessage, ch: Channel): Promise<void> {
    const message = JSON.parse(msg.content.toString());
    const orderId = message.orderId;
    console.log(this.configService.get('RABBITMQ_SIMULATE_CONSUME_ERRORS'));
    console.log('~~~~~~~~~~~~~~~message ', message);
    try {
      if (this.configService.get('RABBITMQ_SIMULATE_CONSUME_ERRORS') === 'true') {
        throw new Error(`Simulated error when order status was updating`);
      }
      // await this.orderService.updateOrderStatus(orderId, ORDER_STATUS.PROCEED);
      ch.ack(msg);
    } catch (error) {
      message.attempt = message.attempt + 1;
      console.log('~~~~~~~~~~~~~~1111~message ', message, msg.properties);
      this.rabbitmqService.publishToQueue('orders.process', message, { correlationId: message.orderId, messageId: message.orderId })
      return;
    }

    if (message.attempt > this.configService.get('RABBITMQ_MAX_ATTEMPTS')) {
      this.rabbitmqService.publishToQueue('orders.dlq', message, { correlationId: message.orderId, messageId: message.orderId })
      ch.ack(msg);
      return;
    }
  }
}
