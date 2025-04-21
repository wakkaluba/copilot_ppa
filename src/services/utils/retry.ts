interface RetryOptions {
    retries?: number;
    backoff?: boolean;
    initialDelay?: number;
    maxDelay?: number;
}

export async function retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = {}
): Promise<T> {
    const {
        retries = 3,
        backoff = true,
        initialDelay = 1000,
        maxDelay = 10000
    } = options;

    let lastError: Error;
    let delay = initialDelay;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;
            
            if (attempt === retries - 1) {
                break;
            }

            await new Promise(resolve => setTimeout(resolve, delay));
            
            if (backoff) {
                delay = Math.min(delay * 2, maxDelay);
            }
        }
    }

    throw lastError;
}