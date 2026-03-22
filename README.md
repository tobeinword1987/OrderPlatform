1) copy .env.example to .env, set unnecessary envs
2) docker compose -f compose.dev.yml up --build
    2 services will run at different ports:
    - app on 3000
    - payments-grpc on 5021

3) docker compose -f compose.dev.yml run --rm seed
4) Postman collection:

    - `./postman/Order_Platform.postman_collection.json`
5) Use for authorization, copy bearer token `accessToken` from response and set it in next requests.

curl --location 'http://localhost:3000/auth/login' \
--header 'Content-Type: application/json' \
--header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6Ikt5cnlsb19PcmxvdiIsImFkbWluIjp0cnVlLCJzY29wZSI6InJvYm90X2RyZWFtcyIsImlhdCI6MTc2OTE2Njc3MCwiZXhwIjoxNzc0MzUwNzcwLCJhdWQiOiJyX2Q6YXVkaWVuY2UiLCJpc3MiOiJyX2Q6aXNzdWVyIn0.N9xK5rqxfYSgxKrwyUm2RYMneAPD66g5uVQKeYm2TMA' \
--data ' {
    "username": "login1",
    "password": "password1"
}'

6) Authorize payment

curl --location 'http://localhost:3000/orders/authorize' \
--header 'Content-Type: application/json' \
--header 'Authorization: ••••••' \
--data '{
    "orderId": "0c6af838-fad5-4f6f-909d-d74886b1d5e2"
}'

7) Use `paymentId` from the response of the curl request above. Call next curl, using that `paymentId` in body:

curl --location --request GET 'http://localhost:3000/orders/paymentStatus' \
--header 'Content-Type: application/json' \
--header 'Authorization: ••••••' \
--data '{
    "paymentId": "use here paymentId from response above"
}'

8) proto file is in the ./proto/payments.proto in the root of project. It is used by both services: app and payments-grpc

9) 
## Limitations

- Orders owns the checkout call orchestration.
- Payments owns the payment state and gRPC contract.
- Interaction only through the gRPC client, without direct import of business   code.
