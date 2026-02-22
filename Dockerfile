FROM node:20-alpine AS deps
WORKDIR /workspace

COPY package.json .

RUN npm install

RUN npm install npx

COPY tsconfig.json tsconfig.json

COPY data.source.ts data.source.ts

COPY src/ src/

RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
