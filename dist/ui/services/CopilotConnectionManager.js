"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CopilotConnectionManager = void 0;
class CopilotConnectionManager {
    constructor(copilotApi, logger) {
        this.copilotApi = copilotApi;
        this.logger = logger;
        this.isInitialized = false;
        this.retryCount = 0;
        this.maxRetries = 3;
    }
    async initialize() {
        try {
            this.isInitialized = await this.copilotApi.initialize();
        }
        catch (error) {
            this.logger.error('Failed to initialize Copilot connection', error);
            this.isInitialized = false;
            throw this.wrapError('Failed to initialize Copilot connection', error);
        }
    }
    async reconnect() {
        if (this.retryCount >= this.maxRetries) {
            throw new Error('Max reconnection attempts reached. Please try again later.');
        }
        try {
            this.retryCount++;
            this.isInitialized = await this.copilotApi.initialize();
            if (this.isInitialized) {
                this.retryCount = 0;
            }
        }
        catch (error) {
            this.logger.error('Reconnection failed', error);
            throw this.wrapError('Failed to reconnect to Copilot', error);
        }
    }
    isConnected() {
        return this.isInitialized;
    }
    wrapError(message, error) {
        return new Error(`${message}: ${this.getErrorMessage(error)}`);
    }
    getErrorMessage(error) {
        return error instanceof Error ? error.message : String(error);
    }
    dispose() {
        this.isInitialized = false;
        this.retryCount = 0;
    }
}
exports.CopilotConnectionManager = CopilotConnectionManager;
//# sourceMappingURL=CopilotConnectionManager.js.map