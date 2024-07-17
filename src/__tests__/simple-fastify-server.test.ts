import http from 'http';
import stream from 'stream';

import axios, { Axios } from 'axios';
import { FastifyInstance } from 'fastify';
import { chain } from 'stream-chain';
import { withParser } from 'stream-json/streamers/StreamValues';

import { SimpleFastifyServer } from '../server/server';
import { buildObjectStreamResponse, sleep } from '../utils/utils';

describe('SimpleFastifyServer', () => {
    let server: SimpleFastifyServer | undefined;

    afterEach(async () => {
        if (server) {
            await server.stop();
            server = undefined;
        }
    });

    function getAxiosClient(port = 3456): Axios {
        return axios.create({
            baseURL: `http://127.0.0.1:${port}`,
            httpAgent: new http.Agent(), // don't share default global agent
        });
    }

    it('Basic server exposes default health endpoint', async () => {
        server = new SimpleFastifyServer(async (_s: FastifyInstance) => {});
        await server.start();

        const { data } = await getAxiosClient().get('/health');
        expect(data).toStrictEqual({ healthy: true });
    });

    it('Server accepts port input', async () => {
        const port = 4444;
        server = new SimpleFastifyServer(async (_s: FastifyInstance) => {}, { port });
        await server.start();

        const { data } = await getAxiosClient(port).get('/health');
        expect(data).toStrictEqual({ healthy: true });
    });

    it('Server exposes a configured endpoint', async () => {
        server = new SimpleFastifyServer(async (s: FastifyInstance) => {
            s.get<{ Querystring: { target: string } }>('/hello-world', async (request, _reply) => {
                return { message: `Hello, ${request.query.target}!` };
            });
        });
        await server.start();

        const { data } = await getAxiosClient().get('/hello-world?target=World');
        expect(data).toStrictEqual({ message: 'Hello, World!' });
    });

    describe('#buildObjectStreamResponse utility', () => {
        it('Server endpoint can use buildObjectStreamResponse utility', async () => {
            server = new SimpleFastifyServer(async (s: FastifyInstance) => {
                s.get('/hello-world/stream', async function (_request, reply) {
                    async function* generateHelloWorld() {
                        await sleep(20);
                        yield* [{ first: 'Hello' }, { second: ', ' }, { third: 'World!' }];
                    }

                    const myStream = buildObjectStreamResponse(generateHelloWorld());
                    reply.header('Content-Type', 'application/octet-stream');
                    return myStream;
                });
            });
            await server.start();

            const response = await getAxiosClient().get('/hello-world/stream', { responseType: 'stream' });
            const rawStream: stream.Readable = response.data;

            const streamChain = chain([rawStream, withParser(), (parsed) => parsed.value]);

            const res = [];
            for await (const chunk of streamChain) {
                res.push(chunk);
            }
            expect(res).toStrictEqual([{ first: 'Hello' }, { second: ', ' }, { third: 'World!' }]);
        });
    });
});
