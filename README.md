# ORDER PLATFORM

## Link to the repo
https://github.com/tobeinword1987/OrderPlatform

## Description of the system

- Main services: app, payments

app includes next modules:
    1. Orders, Products, RabbitMq, Users, Auth, Graph

- Main business countur: Create order

## Checking main business countur

1. cd to the root of the project
2. docker compose -f compose.dev.yml up --build 
3. Wait until integration tests will be passed
4. You can use Swagger API documentation: http://localhost:3000
5. Authorize to the system: http://localhost:3000/api#/App/AppController_login
 - Use body: {
        "username": "login1",
        "password": "password1"
       }
 - Copy accessToken from response and use it for next requests
6. Create order: http://localhost:3000/api#/Orders/OrdersController_createOrder
 - Use body: {
            "idempotencyKey": "10021",
            "userId": "0c6af838-fad5-4f6f-909d-d74886b1d5a1",
            "deliveryAddress": "New delivery addredd, 3/2, loc. 56",
            "products": 
            [
                {
                    "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d9",
                    "quantity": 0
                },
                {
                    "productId": "0c6af838-fad5-4f6f-909d-d74886b1d5d8",
                    "quantity": 0
                }
            ]
       }
 - Be sure that new order was created with orderStatus 'created'

 Then in the rabbitMq queue it is processed, so you can use the same request and you will see that status was changed to the 'proceed'

7. Use endpoint 'get order by id' from postman collection. Use order id which you have get from the above request. This request is graphQl request, use collection: ./postman_collection/GraphQL.postman_collection.json. Confirm, that status of order is 'proceed'. For this request use the same access token you have got before.

8. Authorize payment. http://localhost:3000/api#/Orders/OrdersController_authorize
 - Use order id from the request above

9. Use endpoint 'get order by id' from postman collection. Use order id which you have get from the above request. This request is graphQl request, use collection: ./postman_collection/GraphQL.postman_collection.json. Confirm, that status of order is 'payed'. For this request use the same access token you have got before.

10. You can get payment status from the request: http://localhost:3000/api#/Orders/OrdersController_getPaymentStatus.
 - Use paymentId from the request above

11. Use other requests and enjoy Swagger documentation.

## Docker configuration

1. Build docker and start containers: 
    docker compose -f compose.dev.yml up --build 

2. Stop and delete containers:
    docker compose -f compose.dev.yml down

3. Stop and delete containers and all saved volumes:

    docker compose -f compose.dev.yml down --volumes
    rm -r pgdata_files_module

## API description

1. You can use postman collections:
 - REST API: ./postman_collection/Order_Platform.postman_collection.json
 - GRAPHQL: ./postman_collection/GraphQL.postman_collection.json

2. You can use Swagger documentation when containers are running:
    http://localhost:3000/api

## Logging
   1. I have audit logs in DB, in tables 'audit_log':
   2. I have logs for RabbitMq events. Table 'processed_messages' in DB

   Screenshots are in ./logs_evidence/ folder

## Evidence of working pipelines

1. Build and stage: https://github.com/tobeinword1987/OrderPlatform/actions/runs/25279784272
2. PR checks: https://github.com/tobeinword1987/OrderPlatform/actions/runs/25279705793
3. Prod deploy: https://github.com/tobeinword1987/OrderPlatform/actions/runs/25280566165
