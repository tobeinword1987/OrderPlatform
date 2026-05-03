import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { join } from 'path';
import { PaymentsModule } from './payments.module';

const start = async () => {
  const cert = process.env.GRPC_TLS_CERT;
  const key = process.env.GRPC_TLS_KEY;
  const port = process.env.GRPC_BIND_PORT ?? '5021';

  const app = await NestFactory.createMicroservice<MicroserviceOptions>(
    PaymentsModule,
    {
      transport: Transport.GRPC,
      options: {
        ...(cert && key ? { tlsOptions: { key, cert } } : {}),
        package: 'payments',
        protoPath: join(process.cwd(), 'proto/payments.proto'),
        url: `0.0.0.0:${port}`,
      },
    },
  );

  await app.listen();
  await app.init();
};

start();
