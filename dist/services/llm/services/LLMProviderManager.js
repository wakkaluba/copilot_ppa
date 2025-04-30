"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMProviderManager = exports.ProviderEvent = void 0;
const events_1 = require("events");
const ConnectionPoolManager_1 = require("./ConnectionPoolManager");
const ProviderFactory_1 = require("../providers/ProviderFactory");
const errors_1 = require("../errors");
var ProviderEvent;
(function (ProviderEvent) {
    ProviderEvent["Initialized"] = "provider:initialized";
    ProviderEvent["Removed"] = "provider:removed";
    ProviderEvent["StatusChanged"] = "provider:statusChanged";
    ProviderEvent["MetricsUpdated"] = "provider:metricsUpdated";
})(ProviderEvent || (exports.ProviderEvent = ProviderEvent = {}));
class LLMProviderManager extends events_1.EventEmitter {
    connectionService;
    connectionPool;
    metrics = new Map();
    activeProviders = new Set();
    defaultProviderId;
    constructor(connectionService) {
        super();
        this.connectionService = connectionService;
        this.connectionPool = new ConnectionPoolManager_1.ConnectionPoolManager();
    }
    async initializeProvider(type, config) {
        const factory = ProviderFactory_1.ProviderFactory.getInstance();
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
        this.emit(ProviderEvent.Initialized, {
            providerId,
            timestamp: new Date()
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
    updateMetrics(providerId, latency, isError = false) {
        const metrics = this.metrics.get(providerId);
        if (!metrics)
            return;
        metrics.requestCount++;
        metrics.totalLatency += latency;
        if (isError) {
            metrics.errorCount++;
        }
        metrics.lastUsed = Date.now();
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