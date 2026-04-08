import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './config-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { CategoriesModule } from './categories/categories.module';
import { Category } from './categories/category.entity';
import { Order } from './orders/order.entity';
import { Product } from './products/product.entity';
import { OrderItem } from './orders/order.item.entity';
import { OrdersModule } from './orders/orders.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http.exception.filter';
import { GraphQlModule } from './graphql/graphql.module';
import { DataLoaderModule } from './graphql/dataLoaders/data.loader.module';
import { AuditLogsModule } from './auditLogs/auditLog.module';
import { AuthModule } from './auth/auth.module';
import { Role } from './users/role.entity';
import { RefreshTokens } from './users/refreshTokens.entity';
import { UsersRoles } from './users/usersRoles.entity';
import { FileModule } from './files/file.module';
import { UploadFile } from './files/file.entity';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([UsersRoles, Role]),
    ConfigModule.forRoot({
      isGlobal: true,
      // envFilePath: `./.env.${process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'}`,
      envFilePath: './.env',
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      extraProviders: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        toRetry: (_err: any) => true,
        type: 'postgres',
        host: cfg.get('DB_HOST'),
        port: Number(cfg.get('DB_PORT')),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASSWORD'),
        database: cfg.get('DB_NAME'),
        ssl: cfg.get('DB_SSL') ? { rejectUnauthorized: false } : undefined,
        autoLoadEntities: true,
        synchronize: false,
        migrationsRun: true,
        migrations: [],
        migrationsTableName: 'migrationsHistory',
        migrationsTransactionMode: 'all',
        entities: [
          User,
          Category,
          UploadFile,
          Order,
          OrderItem,
          Product,
          Role,
          RefreshTokens,
          UsersRoles,
        ],
      }),
    }),
    OrdersModule,
    UsersModule,
    CategoriesModule,
    GraphQlModule,
    DataLoaderModule,
    AuditLogsModule,
    AuthModule,
    FileModule,
    RabbitmqModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule {}
