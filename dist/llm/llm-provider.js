"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = exports.LLMProviderError = void 0;
const events_1 = require("events");
/**
 * Error thrown by LLM providers
 */
class LLMProviderError extends Error {
    code;
    constructor(code, message) {
        super(message);
        this.code = code;
        this.name = 'LLMProviderError';
    }
}
exports.LLMProviderError = LLMProviderError;
/**
 * Abstract base class for LLM providers
 * Provides basic implementation of the LLMProvider interface
 */
class BaseLLMProvider extends events_1.EventEmitter {
    name;
    status = {
        isConnected: false,
        activeModel: null,
        modelInfo: null,
        error: null
    };
    constructor(name) {
        super();
        this.name = name;
    }
    getStatus() {
        return { ...this.status };
    }
    updateStatus(partial) {
        this.status = { ...this.status, ...partial };
        this.emit('stateChanged', this.status);
    }
}
exports.BaseLLMProvider = BaseLLMProvider;
//# sourceMappingURL=llm-provider.js.map