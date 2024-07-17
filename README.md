# Super Simple Fastify Web Server

[![npm version](https://badge.fury.io/js/super-simple-fastify-server.svg)](https://badge.fury.io/js/super-simple-fastify-server)
[![CI Status Badge](https://github.com/adamhamlin/super-simple-fastify-server/actions/workflows/ci.yaml/badge.svg)](https://github.com/adamhamlin/super-simple-fastify-server/actions/workflows/ci.yaml)

Super-simple Fastify web server! Quickly spin up a server for dev/test without all the bloat and boilerplate.

> _**NOTE: This is still a WIP!**_

## Install

```bash
npm i --save-dev super-simple-fastify-server
```

## Usage

```ts
import { FastifyInstance, SimpleFastifyServer } from 'super-simple-fastify-server';

const server = new SimpleFastifyServer(
    async (app: FastifyInstance) => {
        fastify.get('/hello-world', async (request, _reply) => {
            return { message: `Hello, ${request.query.target}!` };
        });
    },
    {
        host: '127.0.0.1',
        port: 3456,
    }
);
await server.start();

// ...
// [12:54:50.668] INFO: Server listening at http://127.0.0.1:3456
// [12:54:50.669] INFO: Server http://127.0.0.1:3456 ready to accept connections!

// Now you can hit http://127.0.0.1:3456/hello-world?target=World
```

And when you're done:

```ts
await server.stop();

// ...
// [12:57:16.480] INFO: Server http://127.0.0.1:3456 stopped.
```

## Configuration

The `SimpleFastifyServer` constructor supports the following configuration options. For any omitted options, it will attempt to pull a value from environment before falling back to the default:

-   `host`
    -   Env Var: `SIMPLE_FASTIFY_SERVER_HOST`
    -   Default: `'0.0.0.0'`
-   `port`
    -   Env Var: `SIMPLE_FASTIFY_SERVER_PORT`
    -   Default: `3456`

## Dockerizing the Server

See the [Docker README](./readme/DOCKER.md) for more info.

## Miscellaneous

### Returning response streams

You may want to test a client that consumes a large quantity of data from a JSON response stream. Here is a very simple example using the built-in `buildObjectStreamResponse` utility:

<!-- prettier-ignore -->
```ts
import { FastifyInstance, SimpleFastifyServer, buildObjectStreamResponse, sleep } from 'super-simple-fastify-server';

const server = new SimpleFastifyServer(async (app: FastifyInstance) => {
    app.get('/hello-world/stream', async function (_request, reply) {
        async function* myGeneratorFn() {
            await sleep(2000);
            yield *[
                { message: 'Hello' },
                { message: ', ' },
                { message: 'World!' }
            ];
        }
        const stream = buildObjectStreamResponse(myGeneratorFn());
        reply.header('Content-Type', 'application/octet-stream');
        return stream;
    });
});
```

And, an example client (using [Axios](https://github.com/axios/axios)) to process the response:

<!-- prettier-ignore -->
```ts
import stream from 'stream';
import { chain } from 'stream-chain';
import { withParser } from 'stream-json/streamers/StreamValues';

const response = await myAxiosClient.get('/hello-world/stream', { responseType: 'stream' });
const rawStream: stream.Readable = response.data;

const streamChain = chain([
    rawStream,
    withParser(),
    (parsed) => parsed.value
]);

let fullMessage = '';
for await (const obj of streamChain) {
    fullMessage += obj.message;
}
console.log(fullMessage); // Hello, World!
```
