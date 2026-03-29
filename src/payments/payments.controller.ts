import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type { PaymentData } from './payments.dto';
import { PaymentsService } from './payments.service';
import { UUID } from 'crypto';

@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @GrpcMethod('PaymentsService', 'authorize')
  authorize(data: {
    orderId: UUID;
    amount: number;
    currency: string;
    idempotencyKey: UUID;
  }): PaymentData {
    return this.paymentsService.authorize(data);
  }

  @GrpcMethod('PaymentsService', 'getPaymentStatus')
  getPaymentStatus(data: { paymentId: UUID }): PaymentData {
    return this.paymentsService.getPaymentStatus(data);
  }
}
