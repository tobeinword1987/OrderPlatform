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

There are main principles to build clean and good quality project with a clean and scalable architecture:

1) Domain Design Concern
2) SOLID
3) Separation of concerns

Nest allows us to comply all of these principles. 

ORDER PLATFORM's core domains are based on separate modules that are responsible for specific goals, can depend on each other but their responsibilities are clearly separated from one another. This allows to scale them independently from each other.

ORDER PLATFORM's core modules: UsersModule, ProductsModule, OrdersModule, PaymentsModule.

# UsersModule 

UsersModule is the separate module, which is responsible for authorization, authentication and user's data.

# ProductsModule

ProductsModule is the module which is responsible for processing products.

# OrdersModule

OrdersModule depends on UsersModule and ProductsModule. It is responsible for all user's orders, including the quantity of ordered products, final price for each order, status of the order and so on.

# PaymentsModule

It can be separated into a distinct service, it shouldn't make system's workload too heavy. 

It will use an external services (billing SaaS) to process payments and data that depends on it:
- invoices;
- subscriptions;
- payment statuses

# External services

- Billing SaaS module
- AWS

# Add .env.dev to the configuration folder

# Fill DB with test data

Run commands:

- npm run db:generate
- npm run db:migrate
- npm run db:seed

- npm run start:dev

<!-- # Run Create order API
POST http://localhost:3000/orders

Use body for this:

- 201:
{
    "idempotencyKey": "1000001",
    "userId": "0c6af838-fad5-4f6f-909d-d74886b1d5a1",
    "deliveryAddress": "New delivery addredd, 3/2, loc. 5",
    "products": 
    [
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d9",
            "quantity": 1
        },
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d8",
            "quantity": 2
        }
    ]
}

- You can try to do the same request with the same idempotency_key, the order will be returned

- 400:
{
    "idempotencyKey": "1000002",
    "userId": "0c6af838-fad5-4f6f-909d-d74886b1d5a1",
    "deliveryAddress": "New delivery addredd, 3/2, loc. 5",
    "products": 
    [
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d9",
            "quantity": 1
        },
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d8",
            "quantity": 25
        }
    ]
}

- 404:
{
    "idempotencyKey": "1000003",
    "userId": "0c6af838-fad5-4f6f-909d-d74886b1d525",
    "deliveryAddress": "New delivery addredd, 3/2, loc. 5",
    "products": 
    [
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d9",
            "quantity": 1
        },
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d8",
            "quantity": 25
        }
    ]
}

- 500:
{
    "idempotencyKey": "1000004",
    "userId": "0c6af838-fad5-4f6f-909d-d74886b1d5h5",
    "deliveryAddress": "New delivery addredd, 3/2, loc. 5",
    "products": 
    [
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d9",
            "quantity": 1
        },
        {
            "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d8",
            "quantity": 25
        }
    ]
} -->

<!-- GraphQl homework -->

# GRAPHQL HOMEWORK

# Run test endpoint

POST http://localhost:3000/graphql

{
     test
}

# Run get orders without any filters endpoint

POST http://localhost:3000/graphql

{
    orders
        {
            id
            idempotency_key
            user_id
            delivery_address
            order_status
            created_at
            updated_at
            user {
                id
                first_name
                last_name
                address
                phone_number
                post_code
            }
            orderItems {
                id
                price_at_purchase
                quantity
                product_id
                product {
                    id
                    category_id
                    name
                    quantity
                }
            }
        }
}

# Run get orders endpoint with filters and pagination parameters for cursor pagination

POST http://localhost:3000/graphql

query ordersFiltered($filter: OrdersFilterInput!, $ordersPaginationInput: OrdersPaginationInput!)
{
    ordersFiltered( filter: $filter, ordersPaginationInput: $ordersPaginationInput )
        {
            orders {
                id
                idempotency_key
                user_id
                delivery_address
                order_status
                created_at
                updated_at
                user {
                    id
                    first_name
                    last_name
                    address
                    phone_number
                    post_code
                }
                orderItems {
                    id
                    price_at_purchase
                    quantity
                    product_id
                    product {
                        id
                        category_id
                        name
                        quantity
                    }
                }
        }
        cursor {
            createdAt
            idTieBreaker
        }
        countOfPages
    }
}
------------------------------------------------
variables: 
{
    "filter" : { "status": "CREATED", "dateFrom": "2026-02-12T09:37:45.010Z", "dateTo": "2026-02-18T10:37:45.010Z"},

    "ordersPaginationInput": {"limit": 2}
}

or, but set correct values of createdAt and idTieBreaker, because after db:seed these values will be changed

{
    "filter" : { "status": "CREATED", 
        "dateFrom": "2026-02-12T09:37:45.010Z", 
        "dateTo": "2026-02-18T10:37:45.010Z"
        },
    "ordersPaginationInput": {
        "limit" : 2,
        "createdAt":"2026-02-15T12:15:20.438Z", 
        "idTieBreaker": "ff529ee8-7a8b-4457-a7bc-b04526853257"
        }
}

# Optimization 1 + 1 + (....), additional DataLoader: (implemented for User, OrderItem and Product).

All requests to all tables: OrderItem, Product and User were optimized with batch requests with the Dataloader strategy

You can set in env file STRATEGY env

In case of 'naive'

You will see a lot of comments:
- '---NAIVE---Request to OrderItem table'
- '---NAIVE---Request to Product table'
- '---NAIVE---Request to User table'

If you set strategy: 'optimized'
You will see only 3 requests to the database in comments:
- '---OPTIMIZED---Request to OrderItem table'
- '---OPTIMIZED---Request to Product table'
- '---OPTIMIZED---Request to User table'

LOGS FROM CONSOLE:

In 'naive' case there are next logs from terminal:

---NAIVE---Request to User table
---NAIVE---Request to OrderItem table
---NAIVE---Request to User table
---NAIVE---Request to OrderItem table
---NAIVE---Request to User table
---NAIVE---Request to OrderItem table
---NAIVE---Request to Product table
---NAIVE---Request to Product table
---NAIVE---Request to Product table
---NAIVE---Request to Product table
---NAIVE---Request to Product table

In 'optimized' case there are only 3 logs from terminal:

---OPTIMIZED---Request to User table
---OPTIMIZED---Request to OrderItem table
---OPTIMIZED---Request to Product table

# ORDER_STATUS was added as enum
