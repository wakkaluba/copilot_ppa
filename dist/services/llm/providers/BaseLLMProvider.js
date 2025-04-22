"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = void 0;
const events_1 = require("events");
const types_1 = require("../types");
const errors_1 = require("../errors");
class BaseLLMProvider extends events_1.EventEmitter {
    id;
    name;
    state = types_1.ProviderState.Unknown;
    config;
    currentModel;
    lastError;
    healthCheckTimer;
    constructor(id, name, config) {
        super();
        this.id = id;
        this.name = name;
        this.config = config;
        this.setupHealthCheck();
    }
    setupHealthCheck() {
        if (this.config.healthCheck?.interval) {
            this.healthCheckTimer = setInterval(async () => {
                try {
                    const result = await this.healthCheck();
                    if (!result.isHealthy) {
                        this.handleHealthCheckFailure(result);
                    }
                }
                catch (error) {
                    console.error(`Health check failed for provider ${this.id}:`, error);
                }
            }, this.config.healthCheck.interval);
        }
    }
    async healthCheck() {
        const timeout = this.config.healthCheck?.timeout || 5000;
        try {
            const result = await Promise.race([
                this.performHealthCheck(),
                new Promise((_, reject) => {
                    setTimeout(() => {
                        reject(new errors_1.TimeoutError('Health check timed out', this.id, 'healthCheck', timeout));
                    }, timeout);
                })
            ]);
            return result;
        }
        catch (error) {
            return {
                isHealthy: false,
                latency: -1,
                timestamp: Date.now(),
                error: error instanceof Error ? error : new Error(String(error))
            };
        }
    }
    handleHealthCheckFailure(result) {
        this.lastError = result.error;
        this.emit('healthCheck', {
            providerId: this.id,
            result
        });
    }
    getStatus() {
        return this.state;
    }
    validateConfig() {
        if (!this.config.apiEndpoint) {
            throw new errors_1.ProviderError('API endpoint is required', this.id);
        }
    }
    setState(state) {
        this.state = state;
        this.emit('stateChanged', {
            providerId: this.id,
            state,
            timestamp: Date.now()
        });
    }
    setError(error) {
        this.lastError = error;
        this.setState(types_1.ProviderState.Error);
        this.emit('error', {
            providerId: this.id,
            error,
            timestamp: Date.now()
        });
    }
    async dispose() {
        if (this.healthCheckTimer) {
            clearInterval(this.healthCheckTimer);
        }
        await this.disconnect();
        this.removeAllListeners();
    }
}
exports.BaseLLMProvider = BaseLLMProvider;
//# sourceMappingURL=BaseLLMProvider.js.map