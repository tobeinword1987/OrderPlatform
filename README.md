# E-COMMERCE ORDER PLATFORM
## Description

[Nest](https://github.com/nestjs/nest) framework TypeScript starter repository.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Clean architecture and modularity

There are main priciples to build clean and good quality project with the clean and scalable architecture:

1) Domen Design Concern
2) SOLID
3) Separation of concerns

Nest allows us to complied all of these principles. 

ORDER PLATFORM's core domains are based on separate modules which are responsible for special goals, can depend on each other but their responsibilty is clearly separated from each other. This allows to scale them independently from each other.

ORDER PLATFORM's core modules: UsersModule, ProductsModule, OrdersModule, PaymentsModule.

# UsersModule 

UsersModule is the separate module, which is responsible for authorization, authentication and user's data.

# ProductsModule

ProductsModule is the module which is responsible for processing products.

# OrdersModule

OrdersModule depends on UsersModule and ProductsModule. It is responsible for all user's orders, what is the quantity of ordered products, final price for each order, status of the order and so on.

# PaymentsModule

It can be separated to the separate service, it shouldn't make system's workload too heavy. 

It will use an external services (billing SaaS) to process payments and data which depends on it:
- invoices;
- subscriptions;
- payment statuses

# External services

- Billing SaaS module
- AWS
