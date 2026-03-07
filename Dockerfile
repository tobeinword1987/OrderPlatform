ARG NODE_VERSION="20"
ARG DEBIAN_VERSION="12"

FROM node:${NODE_VERSION}-alpine AS base
RUN adduser -D appuser
USER appuser
WORKDIR /app

FROM base AS deps_dev
COPY package.json .
COPY package-lock.json .
RUN npm ci

FROM base AS deps_prod
COPY package.json .
COPY package-lock.json .
RUN npm ci --omit=dev

FROM deps_dev AS build
COPY tsconfig.json tsconfig.json
COPY data.source.ts data.source.ts
COPY src/ src/
RUN npm run build

FROM build AS dev
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

FROM build AS prod
ENV NODE_ENV=prod

COPY --from=build /app/dist ./dist
COPY --from=deps_prod /app/node_modules ./node_modules
COPY --from=deps_prod /app/package.json ./package.json
COPY --from=deps_prod /app/package-lock.json ./package-lock.json

EXPOSE 3000
CMD ["npm", "start"]

FROM gcr.io/distroless/nodejs${NODE_VERSION}-debian${DEBIAN_VERSION}:nonroot AS prod-distroless
ENV NODE_ENV=prod

EXPOSE 3000

COPY --from=build /app/dist ./dist
COPY --from=deps_prod /app/node_modules ./node_modules
COPY --from=deps_prod /app/package.json ./package.json
COPY --from=deps_prod /app/package-lock.json ./package-lock.json

CMD ["dist/src/main.js"]
