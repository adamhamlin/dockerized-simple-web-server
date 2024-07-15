# Dockerizing the Server

In practice, it may be useful to dockerize your server (e.g., for something like integration testing of a mocked external service).

## How-to

In your npm project:

1. Create an `entry-point.ts` file that initliazes your server and endpoints

    ```ts
    import { FastifyInstance, SimpleFastifyServer } from 'super-simple-fastify-server';

    const server = new SimpleFastifyServer(async (fastify: FastifyInstance) => {
        fastify.get('/hello-world', async (_request, _reply) => {
            return { message: 'Hello, World!' };
        });
    });

    server.start().catch((err) => {
        throw err;
    });
    ```

1. Create a `Dockerfile` which executes your entry-point.

    ```dockerfile
    FROM node

    WORKDIR /app

    COPY package.json package-lock.json ./

    RUN npm ci

    COPY . .

    # For dev, just run typescript files directly
    CMD [ "npx", "ts-node", "entry-point.ts" ]
    ```

1. Create a `.dockerignore` file to preempt some files from being copied over to the image

    ```
    Dockerfile
    node_modules
    ```

1. Create a `docker-compose.yaml` file to orchestrate your containers. Note this is not mandatory, but it makes things easier to manage

    ```yaml
    services:
        web-server:
            build: .
            ports:
                - '${PORT_ON_MY_HOST_MACHINE}:3456'
            volumes:
                - ./entry-point.ts:/app/entry-point.ts
            healthcheck:
                test: curl localhost:3456/health
                start_period: 5s
                start_interval: 1s
    ```

1. Finally, run it

    ```sh
    docker compose up --wait
    ```
