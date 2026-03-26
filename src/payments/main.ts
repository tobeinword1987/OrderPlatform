import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { join } from "path";
import { PaymentsModule } from "./payments.module";

const start = async () => {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(PaymentsModule, {
        transport: Transport.GRPC,
        options: {
            package: 'payments',
            protoPath: join(process.cwd(), 'proto/payments.proto'),
            url: '0.0.0.0:5021'
        },
    });

    await app.listen();
    await app.init();
}

start();
