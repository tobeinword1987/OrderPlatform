import { Controller } from "@nestjs/common";
import { GrpcMethod } from "@nestjs/microservices";
import type { PaymentById, Payment } from './payments.dto'
import type { Metadata, ServerUnaryCall } from '@grpc/grpc-js';
import { PaymentsService } from "./payments.service";

@Controller()
export class PaymentsController {

  constructor(private paymentsService: PaymentsService) {}

  @GrpcMethod('PaymentsService', 'findOne')
  findOne(data: PaymentById, metadata: Metadata, call: ServerUnaryCall<any, any>): Payment | undefined {
    return this.paymentsService.findOne(data, metadata, call);
  }
}
