# Please, use compose.yml for prod images and compose.dev.yml for dev images

# List of commands I have used:

1. ## First, please cd  to the root of the project

2. Set BUILDKIT=1 It will allow you to run only steps you need during docker build command

3. Prod distrolles image uses nonroot user from default. https://github.com/GoogleContainerTools/distroless#debian-12

- docker build --no-cache --target dev -t order-platform-dev-runner .

- docker build --target dev -t order-platform-dev-runner .

- docker build --target prod-distroless -t order-platform-prod-distroless-runner .

- docker build --target prod -t order-platform-prod-runner .

- docker images --filter=reference='order-platform-*-runner:latest'

- docker history order-platform-dev-runner

- docker history order-platform-prod-runner

- docker history order-platform-prod-distroless-runner

- docker compose -f compose.yml up

- docker compose -f compose.dev.yml up

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
