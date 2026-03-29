import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { ObjectType } from '@nestjs/graphql';
import type { UUID } from 'crypto';
import { Order } from './order.entity';

@Entity()
@ObjectType()
@Index('Index_message_order_id', ['orderId'])
@Index('Index_order_procesed_at', ['processedAt'])
export class ProcessedMessage {
  @PrimaryGeneratedColumn('uuid')
  id: UUID;

  @Column({ type: 'uuid', name: 'message_id' })
  messageId: string;

  @Column({ type: 'uuid', name: 'order_id' })
  orderId: string;

  @Column({ name: 'handler', nullable: true })
  handler: string;

  @OneToOne(() => Order, (order) => order.processedMessage, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'order_id', referencedColumnName: 'id' })
  order: Order;

  @CreateDateColumn({ type: 'timestamptz', name: 'processed_at' })
  processedAt: Date;
}
