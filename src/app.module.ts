import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from '@nestjs/config';
import { ConfigService } from './config-service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './users/user.entity';
import { CategoriesModule } from './categories/categories.module';
import { CategoriesService } from './categories/categories.service';
import { Category } from './categories/category.entity';
import { Order } from './orders/order.entity';
import { Product } from './products/product.entity';
import { OrderItem } from './orders/order.item.entity';
import { OrdersModule } from './orders/orders.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from './http.exception.filter';
import { GraphQlModule } from './graphql/graphql.module';
import { DataLoaderModule } from './graphql/dataLoaders/data.loader.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: `./src/configuration/.env.${process.env.NODE_ENV ? process.env.NODE_ENV : 'dev'}`,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      extraProviders: [ConfigService],
      useFactory: (cfg: ConfigService) => ({
        toRetry: (err: any) => true,
        type: 'postgres',
        host: cfg.get('DB_HOST'),
        port: Number(cfg.get('DB_PORT')),
        username: cfg.get('DB_USER'),
        password: cfg.get('DB_PASSWORD'),
        database: cfg.get('DB_NAME'),
        ssl: cfg.get('DB_SSL') ? { rejectUnauthorized: false } : undefined,
        autoLoadEntities: true,
        // synchronize: cfg.get('NODE_ENV') === 'dev' ? true : false,
        synchronize: false,

        migrationsRun: true,
        migrations: [],
        migrationsTableName: 'migrationsHistory',
        migrationsTransactionMode: 'all',
        entities: [User, Category, Order, OrderItem, Product],
      }),
      // dataSourceFactory: async (options) => {
      //   const dataSource = await new DataSource(options as DataSourceOptions).initialize();
      //   return dataSource;
      // },
    }),
    OrdersModule,
    UsersModule,
    CategoriesModule,
    GraphQlModule,
    DataLoaderModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    ConfigService,
    CategoriesService,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class AppModule { }
