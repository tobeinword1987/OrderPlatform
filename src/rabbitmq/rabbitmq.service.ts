import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import type { Channel, ChannelModel, ConsumeMessage, Options } from 'amqplib';
import * as amqp from 'amqplib';
import { ConfigService } from '../../src/config-service';

export type RabbitConsumeHandler = (
  msg: ConsumeMessage,
  channel: Channel,
) => Promise<void>;

export enum queues {
  ORDERS_PROCESS_QUEUE = 'orders.process.queue',
  ORDERS_DLQ_QUEUE = 'orders.dlq.queue',
  DOMAINS_EVENTS_QUEUE = 'domain.events.queue',
}

export const exchanges = {
  'orders.process.queue': 'orders.process.exchange',
  'orders.dlq.queue': 'orders.dlq.exchange',
  'domain.events.queue': 'domain.events.exchange',
};

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: ChannelModel | null = null;
  private channel: Channel | null = null;

  constructor(private readonly configService: ConfigService) {}

  getChannel(): Channel {
    if (!this.channel) {
      throw new Error('RabbitMQ channel is not initialized');
    }
    return this.channel;
  }

  async onModuleInit(): Promise<void> {
    const url =
      this.configService.get('RABBITMQ_URL') ?? 'amqp://localhost:5672';
    const prefetch = Number(
      this.configService.get('RABBITMQ_PREFETCH') ?? '10',
    );

    const client = await amqp.connect(url);
    const ch = await client.createChannel();

    this.connection = client;
    this.channel = ch;

    await this.assertInfrastructure();

    this.logger.log(`RabbitMQ connected (prefetch=${prefetch})`);
  }

  async onModuleDestroy(): Promise<void> {
    try {
      await this.channel?.close();
    } finally {
      await this.connection?.close();
    }
  }

  private async assertInfrastructure(): Promise<void> {
    const ch = this.getChannel();

    await ch.assertQueue(queues.ORDERS_PROCESS_QUEUE, { durable: true });

    await ch.assertExchange(exchanges[queues.ORDERS_PROCESS_QUEUE], 'fanout', {
      durable: false,
    });

    await ch.bindQueue(
      queues.ORDERS_PROCESS_QUEUE,
      exchanges[queues.ORDERS_PROCESS_QUEUE],
      '',
    );

    await ch.assertQueue(queues.ORDERS_DLQ_QUEUE, { durable: true });

    await ch.assertExchange(exchanges[queues.ORDERS_DLQ_QUEUE], 'fanout', {
      durable: false,
    });

    await ch.bindQueue(
      queues.ORDERS_DLQ_QUEUE,
      exchanges[queues.ORDERS_DLQ_QUEUE],
      '',
    );

    await ch.assertQueue(queues.DOMAINS_EVENTS_QUEUE, { durable: true });

    await ch.assertExchange(exchanges[queues.DOMAINS_EVENTS_QUEUE], 'fanout', {
      durable: false,
    });

    await ch.bindQueue(
      queues.DOMAINS_EVENTS_QUEUE,
      exchanges[queues.DOMAINS_EVENTS_QUEUE],
      '',
    );
  }

  publishToExchange(
    exchange: string,
    payload: unknown,
    options?: Options.Publish,
  ): boolean {
    const ch = this.getChannel();
    const body = Buffer.from(JSON.stringify(payload));

    const published = ch.publish(exchange, '', body, {
      contentType: 'application/json',
      persistent: true,
      ...options,
    });

    return published;
  }

  async consume(
    queue: queues,
    handler: RabbitConsumeHandler,
    options?: Options.Consume,
  ): Promise<void> {
    const ch = this.getChannel();

    await ch.consume(
      queue,
      (msg) => {
        if (!msg) {
          return;
        }
        try {
          handler(msg, ch);
        } catch (err) {
          this.logger.error(
            `Unhandled consumer error (queue=${queue})`,
            (err as Error)?.stack ?? String(err),
          );
          ch.nack(msg, false, true);
        }
      },
      {
        noAck: false,
        ...options,
      },
    );
  }
}
