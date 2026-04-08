
# Homework_14_GRPC

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

9) Limitations:

- Orders owns the checkout call orchestration.
- Payments owns the payment state and gRPC contract.
- Interaction only through the gRPC client, without direct import of business   code.
=======

## Users domain was integrated

# Homework_9_Work_with_files_and_AWS_S3

User can:
- upload file to the AWS3 storage with presigned url (@Post('presign')).
  It will generate uploadUrl, which you then can use to upload file to the storage with necessary permissions;
- check, that file exists in storage and set file status to "ready" 
  (@Post('complete'));
- set one of uploaded files as his avatar, llok User domain: (@Post('avatar')).

## Permissions (auth module)

On every controller method I can add decorator Roles([]) with the allowed roles for this operation. User's role will be checked according to what roles user has and what roles are allowed to execute request (jwt-auth.guard.ts). Every role can has many scopes. And the DB structure has already existed. But I didn't use scopes in this app, just RBAC.

Also main jwt-strategy is set to validate each request after user has logged in. 

There are 2 endpoints which allow you to aithorize and then to exchange access token with refresh token, if the first one will expired:

-   @Post('auth/login');
-   @Post('auth/refresh')

## Public url for review

It is generated in S3Service as string which contains from:

 - `https://${this.bucket}.s3.${this.region}.amazonaws.com/${key}`

 or

 - `${endpoint}/${this.bucket}/${key}`

 ## Integration is with entity User and entity Files. This entity has avatarId.

  @Column({ type: 'uuid', name: 'avatar_id', nullable: true })
  avatarId: UUID;

  @OneToOne(
    () => UploadFile,
    file => file.user,
    { nullable: true })
  @JoinColumn({ name: 'avatar_id' })
  avatar?: UploadFile;

  @OneToMany(() => UploadFile, (file) => file.user, { nullable: true })
  files?: UploadFile[];


  @Column({ type: 'uuid', name: 'user_id' })
  userId: string;

  @ManyToOne(() => User, (user) => user.files, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id', referencedColumnName: 'id' })
  user: User;

  One user can create many files and can set one of his own files as his avatar. There is an integration between User and Files entities. Look at fields:  
  Files entity: userId, user
  User entity: avatarId, files

## Avatar is seted during complete endpoint

# Homework_10_Docker_for_production

## Use compose.dev.yml for testing, set necessary envs in .env file.
## Please, use compose.yml for prod images and compose.dev.yml for dev images

## List of commands I have used:

1. ## First, please cd  to the root of the project

2. Set BUILDKIT=1 It will allow you to run only steps you need during docker build command

3. Prod distrolles image uses nonroot user from default. https://github.com/GoogleContainerTools/distroless#debian-12

- copy .env.example to .env, set unnecessary envs
- docker compose -f compose.dev.yml up --build
    2 services will run at different ports:
    - app on 3000
    - payments-grpc on 5021

- docker compose -f compose.dev.yml run --rm seed

- docker compose -f compose.dev.yml run --rm migrate

docker compose -f compose.yml up --build

- docker images --filter=reference='order-platform-*-runner:latest'

- docker history order-platform-dev-runner

- docker history order-platform-prod-runner

- docker history order-platform-prod-distroless-runner

- docker run order-platform-dev-runner whoami

- docker compose -f compose.dev.yml run --rm migration

- docker compose -f compose.dev.yml run --rm seed

2. ## I added screeshots to the description of my homework in LMS

3. ## Results of some commands

 - $ docker images --filter=reference='order-platform-**-runner:latest'

You can see here that image size of app image that uses distroless OS image is less than dev and prod. It is because it uses distroless image, which is free of any unnecessary things like:
- package manager, 
- shell...

Distroless images include only necessary things like:

- The application binary
- Its runtime dependencies (e.g., libc, Java, Python)
- Any explicitly required configuration or metadata


IMAGE  ID   DISK USAGE   CONTENT SIZE
order-platform-dev-runner:latest               0cd4c5035995   699MB   135MB
order-platform-prod-distroless-runner:latest   a49707e823a0  356MB    62.2MB
order-platform-prod-runner:latest              380d45e12327  872MB    153MB

- $  docker history order-platform-prod-distroless-runner
IMAGE          CREATED          CREATED BY                                      SIZE      COMMENT
a49707e823a0   15 minutes ago   CMD ["dist/src/main.js"]                        0B        buildkit.dockerfile.v0
<missing>      15 minutes ago   EXPOSE [3000/tcp]                               0B        buildkit.dockerfile.v0
<missing>      15 minutes ago   COPY /app/package-lock.json ./package-lock.j…   504kB     buildkit.dockerfile.v0
<missing>      15 minutes ago   COPY /app/package.json ./package.json # buil…   8.19kB    buildkit.dockerfile.v0
<missing>      15 minutes ago   COPY /app/node_modules ./node_modules # buil…   155MB     buildkit.dockerfile.v0
<missing>      15 minutes ago   COPY /app/dist ./dist # buildkit                1.45MB    buildkit.dockerfile.v0
<missing>      15 minutes ago   ENV NODE_ENV=prod                               0B        buildkit.dockerfile.v0

4. Please use .env file for secrets. Change it for dev and prod testing.

# Homework 17 CI/CD на GitHub Actions

1. Run eslint, UTS and e2e test on every push: https://github.com/tobeinword1987/OrderPlatform/actions/runs/24154873082

2. Build image, push to the dockerhub and automatically deploy to the stage env on merge: https://github.com/tobeinword1987/OrderPlatform/actions/runs/24155767816

3. Manual deploy on prod (images are got from dockerhub, tag is got from the stage k8s namespace): https://github.com/tobeinword1987/OrderPlatform/actions/runs/24156251429


Note:
I use as stage environment on github actions - "dev" environment. As prod environment - "prod" environment

On kubernetes the same, I deployed to 2 namespaces: "dev" and "prod". You can see it from screenshots in LMS.

I used dockerhub for images and minikube for local deploy with the self-host runner on github actions.
