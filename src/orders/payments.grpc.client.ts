import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import type { ClientGrpc } from "@nestjs/microservices";
import { UUID } from "crypto";
import { Observable, retry, throwError, timeout, timer } from "rxjs";
import { status as GrpcStatus } from '@grpc/grpc-js'

export type PaymentData = {
    paymentId: UUID,
    status: string
}

interface PaymentsService {

    authorize(data: { orderId: UUID, amount: number, currency: string, idempotencyKey: UUID }): Observable<PaymentData>;

    getPaymentStatus(data: { paymentId: string }): Observable<PaymentData>;
}

@Injectable()
export class PaymentsGrpcClient implements PaymentsService, OnModuleInit {
    private paymentsService: PaymentsService;
    private readonly logger = new Logger(PaymentsGrpcClient.name);

    constructor(
        @Inject('PAYMENTS_PACKAGE') private client: ClientGrpc,
        private configService: ConfigService
    ) { }

    onModuleInit() {
        this.paymentsService = this.client.getService<PaymentsService>('PaymentsService');
    }

    private isTransient(error: unknown): boolean {
        const code = (error as { code?: number })?.code;
        return code === GrpcStatus.UNAVAILABLE || code === GrpcStatus.DEADLINE_EXCEEDED;
    }

    authorize(data: { orderId: UUID, amount: number, currency: string, idempotencyKey: UUID }): Observable<PaymentData> {
        let waitMs = Number(this.configService.get('GRPC_MIN_TIMEOUT_RESPONSE_MS'));
        return this.paymentsService.authorize(data)
            .pipe(
                timeout(Number(this.configService.get('GRPC_MAX_TIMEOUT_RESPONSE_MS'))),
                retry({
                    count: Number(this.configService.get('GRPC_MAX_COUNT_RETRIES')),
                    delay: async (error: any, retryCount: number) => {
                        if (!this.isTransient(error)) {
                            return throwError(() => error);
                        }

                        waitMs = waitMs * retryCount;

                        const code = (error as { code?: number })?.code;
                        this.logger.warn(
                            `retry authorize attempt=${retryCount} code=${String(code)} delayMs=${waitMs}`
                        );
                        return timer(waitMs);
                    },
                    resetOnSuccess: true
                }));
    }

    getPaymentStatus(data: { paymentId: string }): Observable<PaymentData> {
        let waitMs = Number(this.configService.get('GRPC_MIN_TIMEOUT_RESPONSE_MS'));
        return this.paymentsService.getPaymentStatus(data)
            .pipe(
                timeout(Number(this.configService.get('GRPC_MAX_TIMEOUT_RESPONSE_MS'))),
                retry({
                    count: Number(this.configService.get('GRPC_MAX_COUNT_RETRIES')),
                    delay: async (error: any, retryCount: number) => {
                        if (!this.isTransient(error)) {
                            return throwError(() => error);
                        }

                        waitMs = waitMs * retryCount;

                        const code = (error as { code?: number })?.code;
                        this.logger.warn(
                            `retry authorize attempt=${retryCount} code=${String(code)} delayMs=${waitMs}`
                        );
                        return timer(waitMs);
                    },
                    resetOnSuccess: true
                }));;
    }
}
