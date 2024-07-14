import MemoryStream from 'memorystream';

/**
 * Async wait function
 */
export async function sleep(ms: number): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get a stream that that will be processed in the specified callback function.
 * NOTE: This function will not await the completion of the callback
 * @param cb callback that should be used to write data to the stream. It does not need
 * to call stream.end() before returning
 */
export function buildStream(cb: (stream: MemoryStream) => Promise<void>): MemoryStream {
    const stream = new MemoryStream();
    cb(stream)
        .finally(() => {
            stream.end();
        })
        .catch((err) => {
            stream.emit('error', err);
        });
    return stream;
}
