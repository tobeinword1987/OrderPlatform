import { UUID } from 'crypto';

export class PaymentStatusDto {
  paymentId: UUID;
}

export type Payment = {
  id: number;
  name: string;
};

export type PaymentData = {
  paymentId: UUID;
  status: PAYMENT_STATE;
};

export type AuthorizedDataPayload = {
  orderId: UUID;
  amount: number;
  currency: string;
  idempotencyKey: UUID;
};

export enum PAYMENT_STATE {
  PAYMENT_FAILED = 'Payment failed',
  PAYMENT_AUTHORIZED = 'Payment authorized',
  PAYMENT_REFUNDED = 'Payment refunded',
  PAYMENT_CAPTURED = 'Payment captured',
}
