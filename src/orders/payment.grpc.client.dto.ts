import { UUID } from 'crypto';

export class PaymentData {
  paymentId: UUID;
  status: string;
}
