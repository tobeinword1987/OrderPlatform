Please, check just changes that are according to the rework of homework # 10 (Docker for production). GRPC homework is just in progress


# Use compose.dev.yml for testing, set necessary envs in .env file.
# Please, use compose.yml for prod images and compose.dev.yml for dev images

# List of commands I have used:

1. ## First, please cd  to the root of the project

2. Set BUILDKIT=1 It will allow you to run only steps you need during docker build command

3. Prod distrolles image uses nonroot user from default. https://github.com/GoogleContainerTools/distroless#debian-12

- docker compose -f compose.dev.yml up -d

- docker compose -f compose.dev.yml down

- docker compose -f compose.dev.yml down --voumes

- docker compose -f compose.yml up -d

- docker compose -f compose.yml down

- docker compose -f compose.yml down --volumes

- docker compose -f compose.yml run --rm migrate

- docker compose -f compose.yml run --rm seed

- docker images --filter=reference='order-platform-*-runner:latest'

- docker history order-platform-dev-runner

- docker history order-platform-prod-runner
