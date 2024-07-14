FROM node:slim

WORKDIR /app

COPY package.json /app

RUN npm ci --production

COPY ./src /app

CMD [ "ts-node", "entry-point.ts" ]