"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OllamaConnectionManager = void 0;
const BaseConnectionManager_1 = require("./BaseConnectionManager");
const types_1 = require("./types");
/**
 * Specialized connection manager for Ollama LLM service
 */
class OllamaConnectionManager extends BaseConnectionManager_1.BaseConnectionManager {
    endpoint = '';
    currentModel = '';
    async establishConnection() {
        if (!this.endpoint) {
            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.InvalidEndpoint, 'Ollama endpoint not configured');
        }
        try {
            const health = await this.performHealthCheck();
            if (health.status === 'error') {
                throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ConnectionFailed, health.message || 'Failed to connect to Ollama');
            }
            this.currentStatus = {
                isConnected: true,
                isAvailable: true,
                error: '',
                metadata: {
                    modelInfo: health.models?.[0]
                }
            };
        }
        catch (error) {
            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ConnectionFailed, `Failed to connect to Ollama: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async terminateConnection() {
        this.currentStatus = {
            isConnected: false,
            isAvailable: false,
            error: ''
        };
    }
    async performHealthCheck() {
        try {
            const response = await fetch(`${this.endpoint}/api/models`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json' }
            });
            if (!response.ok) {
                return {
                    status: 'error',
                    message: `Failed to fetch models: ${response.statusText}`
                };
            }
            const data = await response.json();
            if (!Array.isArray(data.models)) {
                return {
                    status: 'error',
                    message: 'Invalid response format from Ollama API'
                };
            }
            return {
                status: 'ok',
                models: data.models.map((model) => ({
                    id: model.name,
                    name: model.name,
                    provider: 'ollama',
                    capabilities: ['text-generation'],
                    parameters: {
                        ...model.details,
                        modified_at: model.modified_at,
                        size: model.size
                    }
                }))
            };
        }
        catch (error) {
            return {
                status: 'error',
                message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }
    async configure(options) {
        this.endpoint = options.endpoint;
        this.currentModel = options.model || '';
        if (options.healthCheckInterval) {
            this.stopHealthChecks();
            this.startHealthChecks();
        }
        await this.connect();
    }
    getCurrentModel() {
        return this.currentModel;
    }
    async setModel(modelName) {
        const health = await this.performHealthCheck();
        const modelExists = health.models?.some(model => model.name === modelName);
        if (!modelExists) {
            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ModelNotFound, `Model '${modelName}' not found in Ollama instance`);
        }
        this.currentModel = modelName;
        this.currentStatus.metadata = {
            ...this.currentStatus.metadata,
            modelInfo: health.models?.find(model => model.name === modelName)
        };
        this.emit('modelChanged', this.currentStatus);
    }
}
exports.OllamaConnectionManager = OllamaConnectionManager;
//# sourceMappingURL=OllamaConnectionManager.js.map