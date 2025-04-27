"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseConnectionManager = void 0;
const events_1 = require("events");
const LLMProviderRegistryService_1 = require("./services/LLMProviderRegistryService");
const types_1 = require("./types");
const DEFAULT_HEALTH_CONFIG = {
    checkIntervalMs: 30000,
    timeoutMs: 5000,
    unhealthyThreshold: 3,
    healthyThreshold: 2,
    maxConsecutiveFailures: 5
};
/**
 * Base class for LLM connection management
 * Provides common functionality for connection handling, health monitoring, and error management
 */
class BaseConnectionManager extends events_1.EventEmitter {
    constructor(config) {
        super();
        this.activeProvider = null;
        this.currentStatus = {
            isConnected: false,
            isAvailable: false,
            error: ''
        };
        this.healthCheckInterval = null;
        this.retryConfig = {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            backoffFactor: 2,
            currentAttempt: 0,
            timeout: 10000
        };
        this.providerRegistry = new LLMProviderRegistryService_1.LLMProviderRegistryService();
        this.retryConfig = { ...this.retryConfig, ...config };
        this.healthConfig = { ...DEFAULT_HEALTH_CONFIG, ...config };
        this.setupEventHandlers();
    }
    setupEventHandlers() {
        this.providerRegistry.on('providerStatusChanged', this.handleProviderStatusChange.bind(this));
    }
    registerProvider(name, provider) {
        this.providerRegistry.registerProvider(name, provider);
    }
    async configureProvider(name, options) {
        try {
            const provider = await this.providerRegistry.configureProvider(name, options);
            this.activeProvider = provider;
            this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
        }
        catch (error) {
            await this.handleConnectionError(error);
        }
    }
    async connect() {
        this.retryConfig.currentAttempt = 0;
        while (this.retryConfig.currentAttempt < this.retryConfig.maxAttempts) {
            try {
                await this.establishConnection();
                this.startHealthChecks();
                this.emit(types_1.ConnectionEvent.Connected);
                return;
            }
            catch (error) {
                this.retryConfig.currentAttempt++;
                if (this.retryConfig.currentAttempt === this.retryConfig.maxAttempts) {
                    throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ConnectionFailed, `Failed to connect after ${this.retryConfig.maxAttempts} attempts: ${error instanceof Error ? error.message : String(error)}`);
                }
                const delay = Math.min(this.retryConfig.baseDelay * Math.pow(this.retryConfig.backoffFactor, this.retryConfig.currentAttempt), this.retryConfig.maxDelay);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }
    async disconnect() {
        this.stopHealthChecks();
        await this.terminateConnection();
        this.currentStatus = { isConnected: false, isAvailable: false, error: '' };
        this.emit(types_1.ConnectionEvent.Disconnected);
    }
    async handleConnectionError(error) {
        const formattedError = error instanceof Error ? error : new Error(String(error));
        this.currentStatus = {
            ...this.currentStatus,
            isConnected: false,
            error: formattedError.message
        };
        this.emit(types_1.ConnectionEvent.Error, formattedError);
        this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
        if (this.shouldAttemptReconnect(error)) {
            await this.reconnect();
        }
    }
    startHealthChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(async () => {
            try {
                const health = await this.performHealthCheck();
                if (health.status === 'error') {
                    await this.handleHealthCheckFailure(health);
                }
                else {
                    // Reset retry counter on successful health check
                    this.retryConfig.currentAttempt = 0;
                    // Update model info if available
                    if (health.models?.length) {
                        this.currentStatus.metadata = {
                            ...this.currentStatus.metadata,
                            modelInfo: health.models[0]
                        };
                    }
                }
            }
            catch (error) {
                await this.handleConnectionError(error);
            }
        }, this.healthConfig.checkIntervalMs);
    }
    stopHealthChecks() {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    }
    async handleHealthCheckFailure(health) {
        const error = new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.HealthCheckFailed, health.message || 'Health check failed');
        await this.handleConnectionError(error);
    }
    handleProviderStatusChange(data) {
        if (this.activeProvider?.name === data.name) {
            this.currentStatus = data.status;
            this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
        }
    }
    async reconnect() {
        try {
            this.emit(types_1.ConnectionEvent.Reconnecting);
            await this.connect();
        }
        catch (error) {
            console.error('Reconnection failed:', error);
            await this.handleConnectionError(error);
        }
    }
    shouldAttemptReconnect(error) {
        if (this.retryConfig.currentAttempt >= this.retryConfig.maxAttempts) {
            return false;
        }
        // Network-related errors are generally retryable
        if (error instanceof Error) {
            const networkErrors = [
                'ECONNREFUSED',
                'ECONNRESET',
                'ETIMEDOUT',
                'ENOTFOUND',
                'NETWORK_ERROR',
                'DISCONNECT'
            ];
            return networkErrors.some(code => error.message.includes(code));
        }
        return false;
    }
    createConnectionEventData() {
        return {
            state: this.currentStatus.isConnected ? 'connected' : 'disconnected',
            timestamp: new Date(),
            error: this.currentStatus.error ? new Error(this.currentStatus.error) : undefined,
            modelInfo: this.currentStatus.metadata?.modelInfo
        };
    }
    getStatus() {
        return this.currentStatus;
    }
    dispose() {
        this.stopHealthChecks();
        this.disconnect().catch(console.error);
        this.removeAllListeners();
    }
}
exports.BaseConnectionManager = BaseConnectionManager;
//# sourceMappingURL=BaseConnectionManager.js.map