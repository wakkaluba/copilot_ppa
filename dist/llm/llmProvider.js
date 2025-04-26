"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = void 0;
const offlineCache_1 = require("../offline/offlineCache");
class BaseLLMProvider {
    offlineMode = false;
    cache;
    constructor() {
        this.cache = new offlineCache_1.OfflineCache();
    }
    setOfflineMode(enabled) {
        this.offlineMode = enabled;
    }
    async useCachedResponse(prompt) {
        return this.cache.get(prompt);
    }
    async cacheResponse(prompt, response) {
        await this.cache.set(prompt, response);
    }
    async testConnection() {
        return { success: true }; // Default implementation
    }
    getModelId() {
        return 'default'; // Default implementation
    }
    async sendPrompt(prompt, options) {
        return this.generateResponse(prompt, options);
    }
}
exports.BaseLLMProvider = BaseLLMProvider;
//# sourceMappingURL=llmProvider.js.map