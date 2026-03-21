import { Injectable } from "@nestjs/common";
import type { PaymentById, Payment } from './payments.dto'
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js';

@Injectable()
export class PaymentsService {
  findOne(data: PaymentById, metadata: Metadata, call: ServerUnaryCall<any, any>): Payment | undefined {
    const payments = [
      { id: 1, name: 'John\'s payment' },
      { id: 2, name: 'Doe\'s payment' },
    ];
    return payments.find(({ id, name }) => id === data.id);
  }
}
