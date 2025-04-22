"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const ConnectionPoolManager_1 = require("./ConnectionPoolManager");
const ProviderFactory_1 = require("../providers/ProviderFactory");
const errors_1 = require("../errors");
class LLMProviderManager extends events_1.EventEmitter {
    static instance;
    connectionPool;
    metrics = new Map();
    activeProviders = new Set();
    defaultProviderId;
    constructor() {
        super();
        this.connectionPool = new ConnectionPoolManager_1.ConnectionPoolManager();
    }
    static getInstance() {
        if (!LLMProviderManager.instance) {
            LLMProviderManager.instance = new LLMProviderManager();
        }
        return LLMProviderManager.instance;
    }
    async initializeProvider(type, config) {
        const factory = ProviderFactory_1.ProviderFactory.getInstance();
        // Create initial provider instance to get ID
        const provider = await factory.createProvider(type, config);
        const providerId = provider.id;
        // Initialize connection pool for this provider
        await this.connectionPool.initializeProvider(providerId, config);
        // Initialize metrics
        this.metrics.set(providerId, {
            requestCount: 0,
            errorCount: 0,
            totalLatency: 0,
            lastUsed: Date.now()
        });
        this.activeProviders.add(providerId);
        // Set as default if none set
        if (!this.defaultProviderId) {
            this.defaultProviderId = providerId;
        }
        this.emit(types_1.ProviderEvent.Initialized, {
            providerId,
            timestamp: Date.now()
        });
        return providerId;
    }
    async getProvider(providerId) {
        const targetId = providerId || this.defaultProviderId;
        if (!targetId) {
            throw new errors_1.ProviderError('No provider available', 'unknown');
        }
        if (!this.activeProviders.has(targetId)) {
            throw new errors_1.ProviderError('Provider not active', targetId);
        }
        return this.connectionPool.acquireConnection(targetId);
    }
    async releaseProvider(provider) {
        await this.connectionPool.releaseConnection(provider.id, provider);
    }
    setDefaultProvider(providerId) {
        if (!this.activeProviders.has(providerId)) {
            throw new errors_1.ConfigurationError('Provider not active', providerId, 'defaultProvider');
        }
        this.defaultProviderId = providerId;
    }
    getDefaultProviderId() {
        return this.defaultProviderId;
    }
    async generateCompletion(prompt, systemPrompt, options) {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();
        try {
            const response = await provider.generateCompletion(options?.model || 'default', prompt, systemPrompt, options);
            this.updateMetrics(provider.id, Date.now() - start);
            return response;
        }
        catch (error) {
            this.updateMetrics(provider.id, Date.now() - start, true);
            throw error;
        }
        finally {
            await this.releaseProvider(provider);
        }
    }
    async generateChatCompletion(messages, options) {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();
        try {
            const response = await provider.generateChatCompletion(options?.model || 'default', messages, options);
            this.updateMetrics(provider.id, Date.now() - start);
            return response;
        }
        catch (error) {
            this.updateMetrics(provider.id, Date.now() - start, true);
            throw error;
        }
        finally {
            await this.releaseProvider(provider);
        }
    }
    async streamCompletion(prompt, systemPrompt, options, callback) {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();
        try {
            await provider.streamCompletion(options?.model || 'default', prompt, systemPrompt, options, callback);
            this.updateMetrics(provider.id, Date.now() - start);
        }
        catch (error) {
            this.updateMetrics(provider.id, Date.now() - start, true);
            throw error;
        }
        finally {
            await this.releaseProvider(provider);
        }
    }
    async streamChatCompletion(messages, options, callback) {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();
        try {
            await provider.streamChatCompletion(options?.model || 'default', messages, options, callback);
            this.updateMetrics(provider.id, Date.now() - start);
        }
        catch (error) {
            this.updateMetrics(provider.id, Date.now() - start, true);
            throw error;
        }
        finally {
            await this.releaseProvider(provider);
        }
    }
    updateMetrics(providerId, latency, isError = false) {
        const metrics = this.metrics.get(providerId);
        if (!metrics)
            return;
        metrics.requestCount++;
        metrics.totalLatency += latency;
        if (isError)
            metrics.errorCount++;
        metrics.lastUsed = Date.now();
    }
    getMetrics(providerId) {
        const metrics = this.metrics.get(providerId);
        if (!metrics) {
            throw new errors_1.ProviderError('Provider not found', providerId);
        }
        return {
            requestCount: metrics.requestCount,
            errorCount: metrics.errorCount,
            averageLatency: metrics.requestCount > 0
                ? metrics.totalLatency / metrics.requestCount
                : 0,
            successRate: metrics.requestCount > 0
                ? (metrics.requestCount - metrics.errorCount) / metrics.requestCount
                : 1,
            lastUsed: metrics.lastUsed
        };
    }
    getActiveProviders() {
        return Array.from(this.activeProviders);
    }
    async dispose() {
        await this.connectionPool.dispose();
        this.activeProviders.clear();
        this.metrics.clear();
        this.defaultProviderId = undefined;
        this.removeAllListeners();
    }
}
exports.LLMProviderManager = LLMProviderManager;
//# sourceMappingURL=LLMProviderManager.js.map