"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionRetryHandler = void 0;
const events_1 = require("events");
const types_1 = require("./types");
class ConnectionRetryHandler extends events_1.EventEmitter {
    constructor() {
        super();
        this.retryTimeouts = new Map();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ConnectionRetryHandler();
        }
        return this.instance;
    }
    async retry(providerId, operation, config) {
        try {
            await operation();
            this.resetRetry(providerId);
        }
        catch (error) {
            if (!this.isRetryableError(error) || config.currentAttempt >= config.maxAttempts) {
                throw error;
            }
            const delay = this.calculateBackoff(config);
            config.currentAttempt++;
            this.emit('retrying', {
                providerId,
                attempt: config.currentAttempt,
                delay,
                error
            });
            await this.scheduleRetry(providerId, operation, config, delay);
        }
    }
    isRetryableError(error) {
        if (error instanceof types_1.LLMConnectionError) {
            return [
                types_1.LLMConnectionErrorCode.ConnectionFailed,
                types_1.LLMConnectionErrorCode.NetworkError,
                types_1.LLMConnectionErrorCode.Timeout
            ].includes(error.code);
        }
        return true;
    }
    calculateBackoff(config) {
        const backoffDelay = config.baseDelay * Math.pow(config.backoffFactor, config.currentAttempt);
        return Math.min(backoffDelay, config.maxDelay);
    }
    async scheduleRetry(providerId, operation, config, delay) {
        this.clearExistingRetry(providerId);
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(async () => {
                try {
                    await this.retry(providerId, operation, config);
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
                finally {
                    this.retryTimeouts.delete(providerId);
                }
            }, delay);
            this.retryTimeouts.set(providerId, timeout);
        });
    }
    clearExistingRetry(providerId) {
        const existingTimeout = this.retryTimeouts.get(providerId);
        if (existingTimeout) {
            clearTimeout(existingTimeout);
            this.retryTimeouts.delete(providerId);
        }
    }
    resetRetry(providerId) {
        this.clearExistingRetry(providerId);
    }
    dispose() {
        for (const timeout of this.retryTimeouts.values()) {
            clearTimeout(timeout);
        }
        this.retryTimeouts.clear();
        this.removeAllListeners();
    }
}
exports.ConnectionRetryHandler = ConnectionRetryHandler;
//# sourceMappingURL=ConnectionRetryHandler.js.map