import { FastifyInstance } from 'fastify';

/**
 * Default routes
 */
export async function defaultRoutes(fastify: FastifyInstance): Promise<void> {
    fastify.get('/health', async (_request, _reply) => {
        return { healthy: true };
    });
}
