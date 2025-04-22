"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = exports.LLMProviderError = void 0;
const events_1 = require("events");
const offlineCache_1 = require("../offline/offlineCache");
/**
 * Represents an error from an LLM provider
 */
class LLMProviderError extends Error {
    code;
    cause;
    constructor(code, message, cause) {
        super(message);
        this.code = code;
        this.cause = cause;
        this.name = 'LLMProviderError';
    }
}
exports.LLMProviderError = LLMProviderError;
/**
 * Base implementation for LLM providers with common functionality
 */
class BaseLLMProvider extends events_1.EventEmitter {
    offlineMode = false;
    cache;
    status;
    constructor() {
        super();
        this.cache = new offlineCache_1.OfflineCache();
        this.status = {
            isAvailable: false,
            isConnected: false
        };
    }
    setOfflineMode(enabled) {
        this.offlineMode = enabled;
        this.emit('offlineModeChanged', enabled);
    }
    async useCachedResponse(prompt) {
        if (!this.offlineMode)
            return null;
        return this.cache.get(prompt);
    }
    async cacheResponse(prompt, response) {
        await this.cache.set(prompt, response);
    }
    updateStatus(updates) {
        this.status = { ...this.status, ...updates };
        this.emit('statusChanged', this.status);
    }
    getStatus() {
        return { ...this.status };
    }
    handleError(error, code = 'UNKNOWN_ERROR') {
        if (error instanceof LLMProviderError) {
            throw error;
        }
        throw new LLMProviderError(code, error instanceof Error ? error.message : String(error), error);
    }
}
exports.BaseLLMProvider = BaseLLMProvider;
//# sourceMappingURL=llm-provider.js.map