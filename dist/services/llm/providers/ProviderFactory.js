"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProviderFactory = exports.ProviderType = void 0;
var ProviderType;
(function (ProviderType) {
    ProviderType["Ollama"] = "ollama";
    ProviderType["LMStudio"] = "lmstudio";
    ProviderType["Mock"] = "mock";
})(ProviderType || (exports.ProviderType = ProviderType = {}));
class ProviderFactory {
    static instance;
    constructor() { }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ProviderFactory();
        }
        return this.instance;
    }
    async createProvider(type, config) {
        // In a test environment, always return the provided mock
        if (process.env.NODE_ENV === 'test' && config.provider) {
            return config.provider;
        }
        // In production, this would dynamically load and initialize the correct provider
        throw new Error('Not implemented in tests');
    }
}
exports.ProviderFactory = ProviderFactory;
//# sourceMappingURL=ProviderFactory.js.map