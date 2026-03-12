# Lesson 12: RabbitMQ queues + idempotency

- **Orders work queue**: 
1) New order is created with order_status_enum `created`
2) Message about order's processing is published to the exchange `orders.process.exchange`. 
3) Exchange `orders.process.exchange` binds message to the queue `orders.process.queue`.  
4) Processing of order is retried until max limit of retries will be reached. Set this limit in .env file in RABBITMQ_MAX_ATTEMPTS environment.
5) If max limit of attempts is reached, message is published to the exchange `orders.dlq.exchange`. Then exchange binds it to the queue `orders.dlq.queue`

## Quick start, fill .env file with your secrets
```bash
cp .env.example .env
docker build  --no-cache --target dev -t order-platform-dev-runner .
docker compose -f compose.dev.yml up 
```

## Postman
Please import collection:
- `./postman_collection/Order_Platform.postman_collection.json`

RabbitMQ management UI:
- http://localhost:15673 (login/pass: `user1` / `pass1`)

## HOW YOU CAN CHECK:

### Orders queue (orders.process). Successfull scenarius
1. `POST http://localhost:3000/auth/login`
2. Copy accessToken from response and use it for the next request as (Bearer token)
3. `POST http://localhost:3000/orders`
4. In response you will get order with status created
5. Wait for few seconds and repeat create order request. Status should be changed to the 'proceed'

### Retry + DLQ для orders. Unsuccessfull scenarius
For testing you can set RABBITMQ_SIMULATE_CONSUME_ERRORS=true in .env file 
This will throwing errors during handling message in consumer, message will be republished for 3 times and then message will be sent to the `orders.dlq.queue`

You can see it in RabbitMQ UI http://localhost:15673/ (Queues → `orders.dlq.queue`)
