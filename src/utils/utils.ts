import { Readable } from 'stream';

/**
 * Async wait function
 */
export async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Build a readable stream of objects from the supplied generator function. Will coerce objects to strings
 * (using JSON.stringify) such that they are serializable for an http response stream.
 * @param generatorFn function that returns an async generator for the stream
 * @param delimiter the delimiter to use between subsequent objects
 */
export function buildObjectStreamResponse<T extends object>(
    generator: AsyncGenerator<T, void>,
    delimiter = ''
): Readable {
    // eslint-disable-next-line @typescript-eslint/explicit-function-return-type
    async function* stringifyObjects() {
        for await (const obj of generator) {
            yield `${JSON.stringify(obj)}${delimiter}`;
        }
    }
    return Readable.from(stringifyObjects());
}
