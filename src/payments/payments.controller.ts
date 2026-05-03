import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import type {
  PaymentData,
  AuthorizedDataPayload,
  PaymentStatusDto,
} from './payments.dto';
import { PaymentsService } from './payments.service';

@Controller()
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @GrpcMethod('PaymentsService', 'authorize')
  authorize(data: AuthorizedDataPayload): PaymentData {
    return this.paymentsService.authorize(data);
  }

  @GrpcMethod('PaymentsService', 'getPaymentStatus')
  getPaymentStatus(data: PaymentStatusDto): PaymentData {
    return this.paymentsService.getPaymentStatus(data);
  }
}
