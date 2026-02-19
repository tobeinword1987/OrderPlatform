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
import { OrderResolver } from './resolvers/orders/order.resolver';
import { OrderItemResolver } from './resolvers/orders/order.item.resolver';
import { DataLoaderModule } from './dataLoaders/data.loader.module';
import { TestResolver } from './resolvers/test.query.resolver';
import { OrdersService } from 'src/orders/orders.service';
import { OrderDB } from 'src/orders/orders.repo';
import { UserResolver } from './resolvers/users/user.resolver';
import { UsersModule } from 'src/users/users.module';
import { AuthModule } from 'src/auth/auth.module';
import { UsersService } from 'src/users/users.service';

@Module({
  imports: [
    UsersModule,
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
    }),
  ],
  providers: [OrderResolver, OrderItemResolver, TestResolver, OrdersService, OrderDB, UserResolver],
})

export class GraphQlModule { }
