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
import { DataLoaderModule } from './dataLoaders/data.loader.module';
import { TestResolver } from './resolvers/test.query.resolver';
import { OrdersService } from 'src/orders/orders.service';
import { UserResolver } from '../users/user.resolver';
import { UsersModule } from 'src/users/users.module';
import { OrdersModule } from 'src/orders/orders.module';

@Module({
  imports: [
    OrdersModule,
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
  providers: [TestResolver],
})

export class GraphQlModule { }
