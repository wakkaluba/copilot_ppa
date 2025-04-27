"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMService = void 0;
const llmCacheService_1 = require("../cache/llmCacheService");
// Assuming you already have an LLMProvider interface and implementations
class LLMService {
    constructor(provider) {
        this.provider = provider;
        this.cacheService = new llmCacheService_1.LLMCacheService();
    }
    async generateResponse(prompt, options = {}) {
        const model = options.model || this.provider.getDefaultModel();
        const params = {
            temperature: options.temperature || 0.7,
            maxTokens: options.maxTokens || 2000,
            // Other parameters the provider might need
        };
        // Try to get from cache first
        const cachedResponse = await this.cacheService.get(prompt, model, params);
        if (cachedResponse) {
            return cachedResponse;
        }
        // No cache hit, call the provider
        const response = await this.provider.generateText(prompt, model, params);
        // Cache the response
        this.cacheService.set(prompt, model, params, response);
        return response;
    }
    clearCache() {
        this.cacheService.clearCache();
    }
    clearExpiredCache() {
        this.cacheService.clearExpiredCache();
    }
}
exports.LLMService = LLMService;
//# sourceMappingURL=llmService.js.map