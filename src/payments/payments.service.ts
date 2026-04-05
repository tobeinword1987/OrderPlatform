import { Injectable } from '@nestjs/common';
import {
  type PaymentPayload,
  type AuthorizedDataPayload,
  type PaymentData,
  PAYMENT_STATE,
} from './payments.dto';
import { randomUUID, UUID } from 'crypto';
import { RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';

@Injectable()
export class PaymentsService {
  private readonly ordersPaymentDataMap = new Map<
    string,
    { orderId: UUID; paymentId: UUID; status: PAYMENT_STATE }
  >();
  private readonly idempoitencyKeyMap = new Map<
    string,
    { paymentId: UUID; status: PAYMENT_STATE }
  >();

  authorize(data: AuthorizedDataPayload): PaymentData {
    if (
      data.idempotencyKey &&
      this.idempoitencyKeyMap.has(data.idempotencyKey)
    ) {
      return this.idempoitencyKeyMap.get(data.idempotencyKey)!;
    }
    const paymentId = randomUUID();
    const status = PAYMENT_STATE.PAYMENT_AUTHORIZED;
    this.idempoitencyKeyMap.set(data.idempotencyKey, { paymentId, status });
    this.ordersPaymentDataMap.set(paymentId, {
      orderId: data.orderId,
      paymentId,
      status,
    });
    return {
      paymentId,
      status,
    };
  }

  getPaymentStatus(data: PaymentPayload): PaymentData {
    if (!this.ordersPaymentDataMap.has(data.paymentId)) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Payment was not found',
      });
    }
    return this.ordersPaymentDataMap.get(data.paymentId)!;
  }
}
