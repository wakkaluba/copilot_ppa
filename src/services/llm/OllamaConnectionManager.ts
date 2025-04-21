import * as vscode from 'vscode';
import { BaseConnectionManager } from './BaseConnectionManager';
import { 
    ConnectionOptions, 
    HealthCheckResponse, 
    LLMConnectionError,
    LLMConnectionErrorCode,
    ModelInfo
} from './types';

export interface OllamaModelMetadata {
    name: string;
    modified_at: string;
    size: number;
    details: Record<string, unknown>;
}

/**
 * Specialized connection manager for Ollama LLM service
 */
export class OllamaConnectionManager extends BaseConnectionManager {
    private endpoint: string = '';
    private currentModel: string = '';

    protected async establishConnection(): Promise<void> {
        if (!this.endpoint) {
            throw new LLMConnectionError(
                LLMConnectionErrorCode.InvalidEndpoint,
                'Ollama endpoint not configured'
            );
        }

        try {
            const health = await this.performHealthCheck();
            if (health.status === 'error') {
                throw new LLMConnectionError(
                    LLMConnectionErrorCode.ConnectionFailed,
                    health.message || 'Failed to connect to Ollama'
                );
            }

            this.currentStatus = {
                isConnected: true,
                isAvailable: true,
                error: '',
                metadata: {
                    modelInfo: health.models?.[0]
                }
            };
        } catch (error) {
            throw new LLMConnectionError(
                LLMConnectionErrorCode.ConnectionFailed,
                `Failed to connect to Ollama: ${error instanceof Error ? error.message : String(error)}`
            );
        }
    }

    protected async terminateConnection(): Promise<void> {
        this.currentStatus = {
            isConnected: false,
            isAvailable: false,
            error: ''
        };
    }

    protected async performHealthCheck(): Promise<HealthCheckResponse> {
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
                models: data.models.map((model: OllamaModelMetadata) => ({
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
        } catch (error) {
            return {
                status: 'error',
                message: `Health check failed: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    public async configure(options: ConnectionOptions): Promise<void> {
        this.endpoint = options.endpoint;
        this.currentModel = options.model || '';
        
        if (options.healthCheckInterval) {
            this.stopHealthChecks();
            this.startHealthChecks();
        }

        await this.connect();
    }

    public getCurrentModel(): string {
        return this.currentModel;
    }

    public async setModel(modelName: string): Promise<void> {
        const health = await this.performHealthCheck();
        const modelExists = health.models?.some(model => model.name === modelName);
        
        if (!modelExists) {
            throw new LLMConnectionError(
                LLMConnectionErrorCode.ModelNotFound,
                `Model '${modelName}' not found in Ollama instance`
            );
        }

        this.currentModel = modelName;
        this.currentStatus.metadata = {
            ...this.currentStatus.metadata,
            modelInfo: health.models?.find(model => model.name === modelName)
        };
        
        this.emit('modelChanged', this.currentStatus);
    }
}