"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = void 0;
const events_1 = require("events");
const interfaces_1 = require("./interfaces");
const llm_1 = require("../../types/llm");
const ConnectionMetricsTracker_1 = require("./ConnectionMetricsTracker");
const errors_1 = require("./errors");
const connectionUtils_1 = require("./connectionUtils");
/**
 * Base class for LLM providers with common functionality
 */
class BaseLLMProvider extends events_1.EventEmitter {
    name;
    connectionState = llm_1.ConnectionState.DISCONNECTED;
    currentModel;
    metricsTracker;
    lastError;
    constructor(name) {
        super();
        this.name = name;
        this.metricsTracker = new ConnectionMetricsTracker_1.ConnectionMetricsTracker();
    }
    /**
     * Connect to the provider
     */
    async connect(options) {
        try {
            this.connectionState = llm_1.ConnectionState.CONNECTING;
            this.emit('stateChanged', this.connectionState);
            const startTime = Date.now();
            await this.performConnect(options);
            const endTime = Date.now();
            this.metricsTracker.recordConnectionSuccess();
            this.metricsTracker.recordRequest(endTime - startTime);
            this.connectionState = llm_1.ConnectionState.CONNECTED;
            this.emit('stateChanged', this.connectionState);
            this.emit('connected');
        }
        catch (error) {
            const formattedError = (0, connectionUtils_1.formatProviderError)(error, this.name);
            this.handleError(formattedError);
            throw formattedError;
        }
    }
    /**
     * Disconnect from the provider
     */
    async disconnect() {
        try {
            await this.performDisconnect();
            this.connectionState = llm_1.ConnectionState.DISCONNECTED;
            this.emit('stateChanged', this.connectionState);
            this.emit('disconnected');
        }
        catch (error) {
            const formattedError = (0, connectionUtils_1.formatProviderError)(error, this.name);
            this.handleError(formattedError);
            throw formattedError;
        }
    }
    /**
     * Get current connection status
     */
    getStatus() {
        return {
            state: this.connectionState,
            error: this.lastError,
            modelInfo: this.currentModel,
            metadata: {
                metrics: this.metricsTracker.getMetrics()
            }
        };
    }
    /**
     * Check if provider is available
     */
    async isAvailable() {
        try {
            const health = await this.healthCheck();
            return health.status === 'ok';
        }
        catch {
            return false;
        }
    }
    /**
     * Get current model info
     */
    async getModelInfo() {
        if (!this.currentModel) {
            try {
                this.currentModel = await this.loadModelInfo();
            }
            catch (error) {
                const formattedError = (0, connectionUtils_1.formatProviderError)(error, this.name);
                this.handleError(formattedError);
                throw formattedError;
            }
        }
        return this.currentModel;
    }
    /**
     * Set active model
     */
    async setModel(modelId) {
        const models = await this.getAvailableModels();
        const model = models.find(m => m.id === modelId);
        if (!model) {
            throw new errors_1.ModelNotFoundError(modelId);
        }
        await this.loadModel(model);
        this.currentModel = model;
    }
    /**
     * Handle provider error
     */
    handleError(error) {
        this.lastError = error;
        this.emit('error', error);
        if (error instanceof errors_1.LLMConnectionError) {
            if (error.code === interfaces_1.ConnectionErrorCode.PROVIDER_UNAVAILABLE) {
                this.connectionState = llm_1.ConnectionState.DISCONNECTED;
            }
            else {
                this.connectionState = llm_1.ConnectionState.ERROR;
            }
        }
        else {
            this.connectionState = llm_1.ConnectionState.ERROR;
        }
        this.emit('stateChanged', this.connectionState);
        this.metricsTracker.recordRequestFailure(error);
    }
    /**
     * Dispose of provider resources
     */
    dispose() {
        if (this.connectionState === llm_1.ConnectionState.CONNECTED) {
            this.disconnect().catch(console.error);
        }
        this.removeAllListeners();
    }
}
exports.BaseLLMProvider = BaseLLMProvider;
//# sourceMappingURL=BaseLLMProvider.js.map