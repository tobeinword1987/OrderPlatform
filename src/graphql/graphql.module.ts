import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';
import { ApolloDriver, ApolloDriverConfig } from '@nestjs/apollo';
import { Order } from '../../src/orders/order.entity';
import { OrderItem } from '../../src/orders/order.item.entity';
import { Product } from '../../src/products/product.entity';
import { User } from '../../src/users/user.entity';
import { DtLoader } from './dataLoaders/data.loader';
import { DataLoaderModule } from './dataLoaders/data.loader.module';
import { TestResolver } from './resolvers/test.query.resolver';
import { UsersModule } from '../../src/users/users.module';
import { OrdersModule } from '../../src/orders/orders.module';
import { APP_FILTER } from '@nestjs/core';
import { HttpExceptionFilter } from '../../src/http.exception.filter';
import { ApolloServerErrorCode } from '@apollo/server/errors';

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
        autoSchemaFile: true,
        sortSchema: true,
        definitions: {
          emitTypenameField: true,
          enumsAsTypes: true,
        },
        context: () => ({
          loaders: dtLoader.createLoaders(),
          strategy: process.env['STRATEGY'] || ('optimized' as const),
        }),
        formatError: (formattedError, error) => {
          console.log(error);
          if (
            formattedError?.extensions?.code ===
            ApolloServerErrorCode.GRAPHQL_VALIDATION_FAILED
          ) {
            return {
              ...formattedError,
              message:
                "Your query doesn't match the schema. Try double-checking it!",
            };
          }
          return {
            message: formattedError.message,
            extensions: {
              code: formattedError?.extensions?.code,
            },
          };
        },
      }),
    }),
  ],
  providers: [
    TestResolver,
    {
      provide: APP_FILTER,
      useClass: HttpExceptionFilter,
    },
  ],
})
export class GraphQlModule {}
