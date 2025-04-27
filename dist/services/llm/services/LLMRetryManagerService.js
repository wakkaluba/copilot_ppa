"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RetryManagerService = void 0;
class RetryManagerService {
    constructor(options = {}) {
        this.retryTimeout = null;
        this.maxRetries = options.retryConfig?.maxRetries || 3;
        this.retryDelay = options.retryConfig?.retryDelay || 1000;
    }
    async handleConnectionFailure(operation) {
        let retries = 0;
        while (retries < this.maxRetries) {
            try {
                return await operation();
            }
            catch (error) {
                retries++;
                if (retries >= this.maxRetries) {
                    throw error;
                }
                await this.delay(this.retryDelay * Math.pow(2, retries - 1));
            }
        }
        throw new Error('Max retries exceeded');
    }
    clearRetryTimeout() {
        if (this.retryTimeout) {
            clearTimeout(this.retryTimeout);
            this.retryTimeout = null;
        }
    }
    delay(ms) {
        return new Promise(resolve => {
            this.retryTimeout = setTimeout(resolve, ms);
        });
    }
}
exports.RetryManagerService = RetryManagerService;
//# sourceMappingURL=LLMRetryManagerService.js.map