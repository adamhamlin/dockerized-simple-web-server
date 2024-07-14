# Dockerizing the Server

In practice, it may be useful to dockerize your server (e.g., for something like integration testing of a mocked external service).

## How-to

In your npm project:

1. Create an `entry-point.ts` file that initliazes your server and endpoints

    ```ts
    import { FastifyInstance, SimpleFastifyServer } from 'super-simple-fastify-server';

    const server = new SimpleFastifyServer(async (app: FastifyInstance) => {
        fastify.get('/hello-world', async (request, _reply) => {
            return { message: `Hello, ${request.query.target}!` };
        });
    });

    server.start().catch((err) => {
        throw err;
    });
    ```

1. Create a `Dockerfile` which executes your entry-point.

    > _NOTE: This assumes all your source files are contained in a local `./src` directory_

    ```docker
    FROM node:slim

    WORKDIR /app

    COPY package.json /app

    RUN npm ci

    COPY ./src /app

    CMD [ "ts-node", "entry-point.ts" ]
    ```

1. Create a `docker-compose.yaml` file. Note this is not mandatory, but it makes things easier to manage

    ```yaml
    services:
        web-server:
            build: .
            ports:
                - '${PORT_ON_MY_HOST_MACHINE}:3456'
            environment:
                BLAH: 3
            #volumes:
            #    - whatever:whatever
            healthcheck:
                test: curl http://localhost:3456/health
                start_period: 5s
                start_interval: 1s
    ```

1. Finally, run it

    ```sh
    docker compose up --wait
    ```
