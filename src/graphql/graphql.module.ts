import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'path';
import { Order } from 'src/orders/order.entity';
import { OrderItem } from 'src/orders/order.item.entity';
import { Product } from 'src/products/product.entity';
import { User } from 'src/users/user.entity';
import { DtLoader } from './dataLoaders/data.loader';
import { OrderResolver } from './resolvers/order.resolver';
import { OrderItemResolver } from './resolvers/order.item.resolver';
import { DataLoaderModule } from './dataLoaders/data.loader.module';
import { TestResolver } from './resolvers/test.query.resolver';
import { OrdersService } from 'src/orders/orders.service';
import { OrderDB } from 'src/orders/orders.repo';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem, Product, User]),
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [DataLoaderModule],
      inject: [DtLoader],
      useFactory: (dtLoader: DtLoader) => ({
        path: '/graphql',
        graphiql: true,
        autoSchemaFile: join(process.cwd(), '/graphql.gql'),
        sortSchema: true,
        definitions: {
          emitTypenameField: true,
          enumsAsTypes: true,
        },
        context: () => ({
          loaders: dtLoader.createLoaders(),
          strategy: process.env['STRATEGY'] || 'optimized' as const
        })
      })
    })
  ],
  providers: [OrderResolver, OrderItemResolver, TestResolver, OrdersService, OrderDB],
})

export class GraphQlModule { }
