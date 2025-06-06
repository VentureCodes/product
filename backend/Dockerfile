FROM node:alpine as base

WORKDIR /app

COPY package*.json ./
ARG NODE_ENV
ENV NODE_ENV $NODE_ENV

RUN npm install

COPY . .

RUN npx prisma generate

RUN npm run build

FROM base as builder

WORKDIR /app

RUN -rf node_modules
RUN npm i --omit=dev

FROM node:alpine as runtime

WORKDIR /app

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/build ./build
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules

CMD ["npm", "run", "start"]
