# List of commands I have used:

1. ## First, please cd  to the root of the project

2. Set BUILDKIT=1 It will allow you to run only steps you need during docker build command

3. Prod distrolles image uses nonroot user from default. https://github.com/GoogleContainerTools/distroless#debian-12

- docker build --no-cache --target dev_runner -t order-platform-dev-runner .

- docker build --target dev_runner -t order-platform-dev-runner .

- docker build --no-cache --target prod_distrolles_runner -t order-platform-prod-runner .

- docker images --filter=reference='order-platform-*-runner:latest'

- docker history order-platform-dev-runner

- docker history order-platform-prod-runner

- docker compose -f docker-compose-prod.yml up

- docker compose -f docker-compose-dev.yml up

- docker run order-platform-dev-runner whoami

- docker compose -f docker-compose-dev.yml run --rm migration

- docker compose -f docker-compose-dev.yml run --rm seed

2. ## I added screeshots to the description of my homework in LMS
