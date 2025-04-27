"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.retry = void 0;
async function retry(fn, options = {}) {
    const { retries = 3, backoff = true, initialDelay = 1000, maxDelay = 10000 } = options;
    let lastError;
    let delay = initialDelay;
    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            return await fn();
        }
        catch (error) {
            lastError = error;
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
exports.retry = retry;
//# sourceMappingURL=retry.js.map