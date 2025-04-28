"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMConnectionError = void 0;
exports.calculateRetryDelay = calculateRetryDelay;
exports.testConnection = testConnection;
exports.delay = delay;
exports.createTimeout = createTimeout;
exports.withTimeout = withTimeout;
const interfaces_1 = require("./interfaces");
/**
 * Custom error class for LLM connection errors
 */
class LLMConnectionError extends Error {
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'LLMConnectionError';
    }
}
exports.LLMConnectionError = LLMConnectionError;
/**
 * Calculate delay for retry attempts using exponential backoff
 */
function calculateRetryDelay(attempt, options) {
    const delay = Math.min(options.baseRetryDelay * Math.pow(2, attempt), options.maxRetryDelay);
    // Add jitter to prevent thundering herd
    return delay + Math.random() * (delay * 0.1);
}
/**
 * Test connection to an LLM endpoint
 */
async function testConnection(endpoint, timeout) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        const response = await fetch(endpoint, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);
        return response.ok;
    }
    catch {
        return false;
    }
}
/**
 * Create a promise that resolves after the specified delay
 */
function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
/**
 * Create a promise that rejects after the specified timeout
 */
function createTimeout(ms) {
    return new Promise((_, reject) => {
        setTimeout(() => {
            reject(new LLMConnectionError(interfaces_1.ConnectionErrorCode.TIMEOUT, `Operation timed out after ${ms}ms`));
        }, ms);
    });
}
/**
 * Execute a promise with a timeout
 */
async function withTimeout(promise, timeoutMs, operation = 'Operation') {
    const result = await Promise.race([
        promise,
        createTimeout(timeoutMs)
    ]);
    return result;
}
//# sourceMappingURL=utils.js.map