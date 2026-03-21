import { Inject, Injectable, Logger, OnApplicationBootstrap, OnModuleInit } from '@nestjs/common';
import { RabbitConsumeHandler, RabbitmqService, exchanges, queues } from 'src/rabbitmq/rabbitmq.service';
import { ORDER_STATUS } from './order.dto';
import { Channel, ConsumeMessage } from 'amqplib';
import { OrdersService } from './orders.service';
import { ConfigService } from '@nestjs/config';
import type { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom, Observable } from 'rxjs';

interface PaymentsService {
  findOne(data: { id: number }): Observable<any>;
}

@Injectable()
export class OrdersWorkerService implements OnApplicationBootstrap, OnModuleInit {
  private readonly logger = new Logger(RabbitmqService.name);
  private paymentsService: PaymentsService;
  constructor(
    @Inject('PAYMENTS_PACKAGE') private client: ClientGrpc,
    private orderService: OrdersService,
    private rabbitmqService: RabbitmqService,
    private configService: ConfigService,
  ) { }

  onModuleInit() {
    console.log('~~~~~~~~~~~~~~~~~~Module was was was initiated')
    this.paymentsService = this.client.getService<PaymentsService>('PaymentsService');
  }

  getPayment(): Observable<string> {
    return this.paymentsService.findOne({ id: 1 });
  }

  async onApplicationBootstrap() {
    await this.rabbitmqService.consume(queues.ORDERS_PROCESS_QUEUE, this.handleMessage.bind(this), {
      noAck: false
    });
  }

  async handleMessage(msg: ConsumeMessage, ch: Channel): Promise<void> {
    const message = JSON.parse(msg.content.toString());
    const orderId = message.orderId;
    try {
      // if (this.configService.get('RABBITMQ_SIMULATE_CONSUME_ERRORS') === 'true') {
      //   throw new Error(`Simulated error when order status was updating`);
      // }
      await this.orderService.updateOrderStatus(orderId, ORDER_STATUS.PROCEED, message.messageId);
      const payment = await firstValueFrom(this.getPayment());
      console.log('&*&*&*&*&*&*&*', payment);
      console.log('&*&*&*&*&*&*&');
      ch.ack(msg);
    } catch (error) {
      console.log(error);
      message.attempt = message.attempt + 1;

      if (message.attempt > this.configService.get('RABBITMQ_MAX_ATTEMPTS')) {
        console.log('Limit of attempts are reached to the MAX value');
        ch.ack(msg);
        this.rabbitmqService.publishToExchange(exchanges[queues.ORDERS_DLQ_QUEUE], message, { correlationId: message.orderId, messageId: message.orderId })
        return;
      }

      ch.ack(msg);
      this.rabbitmqService.publishToExchange(exchanges[queues.ORDERS_PROCESS_QUEUE], message, { correlationId: message.orderId, messageId: message.orderId });
    }
  }
}
