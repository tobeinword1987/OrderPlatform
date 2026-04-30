import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './order.entity';
import { OrderItem } from './order.item.entity';
import { OrdersService } from './orders.service';
import { OrdersController } from './orders.controller';
import { OrderDB } from './orders.repo';
import { OrderResolver } from './order.resolver';
import { OrderItemResolver } from './order.item.resolver';
import { User } from '../../src/users/user.entity';
import { Product } from '../../src/products/product.entity';
import { Repository } from 'typeorm';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from '../../src/auth/jwt-auth.guard';
import { UsersRoles } from '../../src/users/usersRoles.entity';
import { Role } from '../../src/users/role.entity';
import { RabbitmqModule } from '../../src/rabbitmq/rabbitmq.module';
import { OrdersWorkerService } from './orders.worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { ProcessedMessage } from '../../src/orders/processed.message.entity';
import { join } from 'path';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PaymentsGrpcClient } from './payments.grpc.client';
import { AuditLog } from '../auditLogs/auditLog.entity';
import { OrdersWorkerFailed } from './orders.worker.failed';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AuditLog,
      Order,
      OrderItem,
      User,
      Product,
      ProcessedMessage,
      UsersRoles,
      Role,
    ]),
    RabbitmqModule,
    ClientsModule.registerAsync([
      {
        name: 'PAYMENTS_PACKAGE',
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => ({
          transport: Transport.GRPC,
          options: {
            tlsOptions: {
              ca: [configService.get<string>('GRPC_TLS_CERT')],
            },
            package: 'payments',
            protoPath: join(process.cwd(), 'proto/payments.proto'),
            url: configService.get<string>(
              'PAYMENTS_GRPC_URL',
              'localhost:5021',
            ),
          },
        }),
      },
    ]),
  ],
  providers: [
    OrderResolver,
    OrderItemResolver,
    OrdersService,
    OrdersWorkerService,
    OrdersWorkerFailed,
    PaymentsGrpcClient,
    OrderDB,
    Repository<Order>,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  controllers: [OrdersController],
  exports: [OrderResolver, OrderItemResolver, OrderDB],
})
export class OrdersModule {}
