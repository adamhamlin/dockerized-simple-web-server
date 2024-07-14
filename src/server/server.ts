import fastifyFn, { FastifyInstance, FastifyPluginAsync } from 'fastify';

import { defaultRoutes } from './routes/default-routes';

type ServerOptions = {
    host: string;
    port: number;
};

export class SimpleFastifyServer {
    private readonly options: ServerOptions;
    private address: string | undefined;

    /**
     * The wrapped fastify server instance
     *
     * NOTE: Exposing for flexibility
     */
    readonly fastify: FastifyInstance;

    /**
     * @param registerFn function used to register server routes
     * @param options server configuration options
     */
    constructor(registerFn: FastifyPluginAsync, options?: Partial<ServerOptions>) {
        this.options = {
            host: process.env.SIMPLE_FASTIFY_SERVER_HOST ?? '0.0.0.0',
            port: Number(process.env.SIMPLE_FASTIFY_SERVER_PORT ?? '3456'),
            ...options,
        };
        this.fastify = fastifyFn({
            logger: {
                transport: {
                    target: 'pino-pretty',
                    options: {
                        singleLine: true,
                        ignore: [
                            'pid',
                            'hostname',
                            'req.hostname',
                            'req.remoteAddress',
                            'req.remotePort',
                            'responseTime',
                        ].join(','),
                    },
                },
            },
        });
        this.fastify.register(defaultRoutes);
        this.fastify.register(registerFn);
    }

    /**
     * Start the server
     */
    async start(): Promise<void> {
        const { host, port } = this.options;
        this.address = await this.fastify.listen({ host, port });
        this.fastify.log.info(`Server ${this.address} ready to accept connections!`);
    }

    /**
     * Stop the server
     */
    async stop(): Promise<void> {
        await this.fastify.close();
        this.fastify.log.info(`Server ${this.address} stopped.`);
    }
}
