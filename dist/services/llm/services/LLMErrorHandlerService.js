"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMErrorHandlerService = void 0;
const events_1 = require("events");
const types_1 = require("../types");
class LLMErrorHandlerService extends events_1.EventEmitter {
    constructor() {
        super();
        this.maxRetries = 3;
        this.baseDelay = 1000; // 1 second
        this.retryCount = new Map();
    }
    async handleError(error, errorContext) {
        const formattedError = this.formatError(error);
        const errorId = this.generateErrorId(formattedError);
        this.emit('error', { error: formattedError, errorId });
        if (this.shouldRetry(formattedError)) {
            await this.handleRetry(errorId, formattedError);
        }
        else {
            this.retryCount.delete(errorId);
            throw formattedError;
        }
    }
    formatError(error) {
        if (error instanceof types_1.LLMConnectionError) {
            return error;
        }
        const message = error instanceof Error ? error.message : String(error);
        return new types_1.LLMConnectionError(message, types_1.LLMConnectionErrorCode.Unknown);
    }
    generateErrorId(error) {
        return `${error.code}-${Date.now()}`;
    }
    shouldRetry(error) {
        const retryableErrors = [
            types_1.LLMConnectionErrorCode.NetworkError,
            types_1.LLMConnectionErrorCode.Timeout,
            types_1.LLMConnectionErrorCode.RateLimited,
            types_1.LLMConnectionErrorCode.ServiceUnavailable
        ];
        return retryableErrors.includes(error.code);
    }
    async handleRetry(errorId, error) {
        const currentRetries = this.retryCount.get(errorId) || 0;
        if (currentRetries >= this.maxRetries) {
            this.retryCount.delete(errorId);
            throw error;
        }
        const delay = this.calculateRetryDelay(currentRetries);
        this.retryCount.set(errorId, currentRetries + 1);
        this.emit('retrying', {
            error,
            retryCount: currentRetries + 1,
            delay
        });
        await new Promise(resolve => setTimeout(resolve, delay));
    }
    calculateRetryDelay(retryCount) {
        // Exponential backoff with jitter
        const exponentialDelay = this.baseDelay * Math.pow(2, retryCount);
        const jitter = Math.random() * 0.3 * exponentialDelay; // 30% jitter
        return Math.min(exponentialDelay + jitter, 30000); // Max 30 seconds
    }
    setRetryStrategy(strategy) {
        this.maxRetries = strategy.maxRetries ?? this.maxRetries;
        this.baseDelay = strategy.baseDelay ?? this.baseDelay;
    }
    dispose() {
        this.removeAllListeners();
        this.retryCount.clear();
    }
}
exports.LLMErrorHandlerService = LLMErrorHandlerService;
//# sourceMappingURL=LLMErrorHandlerService.js.map