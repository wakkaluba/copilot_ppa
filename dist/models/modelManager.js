"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelManager = void 0;
const ollamaProvider_1 = require("../llm/ollamaProvider");
const lmStudioProvider_1 = require("../llm/lmStudioProvider");
class ModelManager {
    activeModel = null;
    models = new Map();
    providers = new Map();
    constructor() {
        this.initializeProviders();
    }
    initializeProviders() {
        this.providers.set('ollama', new ollamaProvider_1.OllamaProvider());
        this.providers.set('lmstudio', new lmStudioProvider_1.LMStudioProvider());
    }
    async addModel(config) {
        this.models.set(config.name, config);
    }
    async switchModel(modelName) {
        const config = this.models.get(modelName);
        if (!config) {
            throw new Error(`Model ${modelName} not found`);
        }
        const provider = this.providers.get(config.provider);
        if (!provider) {
            throw new Error(`Provider ${config.provider} not found`);
        }
        await provider.initialize(config);
        this.activeModel = provider;
    }
    getActiveModel() {
        if (!this.activeModel) {
            throw new Error('No active model');
        }
        return this.activeModel;
    }
    getAvailableModels() {
        return Array.from(this.models.keys());
    }
}
exports.ModelManager = ModelManager;
//# sourceMappingURL=modelManager.js.map