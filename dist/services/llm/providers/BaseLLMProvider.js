"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseLLMProvider = exports.ProviderState = void 0;
const events_1 = require("events");
const errors_1 = require("../errors");
// Define locally any types that aren't in the main types file
var ProviderState;
(function (ProviderState) {
    ProviderState["Unknown"] = "unknown";
    ProviderState["Registered"] = "registered";
    ProviderState["Initializing"] = "initializing";
    ProviderState["Active"] = "active";
    ProviderState["Deactivating"] = "deactivating";
    ProviderState["Inactive"] = "inactive";
    ProviderState["Error"] = "error";
})(ProviderState || (exports.ProviderState = ProviderState = {}));
class BaseLLMProvider extends events_1.EventEmitter {
    constructor(id, name, config) {
        super();
        this.id = id;
        this.name = name;
        this.state = ProviderState.Unknown;
        this.config = config;
        this.setupHealthCheck();
    }
    async healthCheck() {
        try {
            const startTime = Date.now();
            const result = await this.performHealthCheck();
            const endTime = Date.now();
            this.lastHealthCheck = {
                ...result,
                latency: endTime - startTime,
                timestamp: endTime
            };
            return this.lastHealthCheck;
        }
        catch (error) {
            const result = {
                isHealthy: false,
                error: error instanceof Error ? error : new Error(String(error)),
                latency: 0,
                timestamp: new Date()
            };
            this.handleHealthCheckFailure(result);
            return result;
        }
    }
    handleHealthCheckFailure(result) {
        this.setError(result.error || new Error('Health check failed'));
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
            timestamp: new Date()
        });
    }
    setError(error) {
        this.lastError = error;
        this.setState(ProviderState.Error);
        this.emit('error', {
            providerId: this.id,
            error,
            timestamp: new Date()
        });
    }
    getStatus() {
        return {
            state: this.state,
            activeModel: this.currentModel?.id,
            error: this.lastError,
            lastHealthCheck: this.lastHealthCheck
        };
    }
    async dispose() {
        if (this.healthCheckTimer) {
            clearTimeout(this.healthCheckTimer);
        }
        await this.disconnect();
        this.removeAllListeners();
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
}
exports.BaseLLMProvider = BaseLLMProvider;
//# sourceMappingURL=BaseLLMProvider.js.map