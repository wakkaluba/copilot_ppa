import * as vscode from 'vscode';
import fetch from 'node-fetch';
import { BaseConnectionManager } from './BaseConnectionManager';
import { 
    ConnectionOptions, 
    HealthCheckResponse, 
    LLMConnectionError,
    LLMConnectionErrorCode,
    ModelInfo 
} from './types';

export class OllamaConnectionManager extends BaseConnectionManager {
    private apiEndpoint: string = '';

    protected async establishConnection(): Promise<void> {
        if (!this.options?.endpoint) {
            throw new LLMConnectionError(
                LLMConnectionErrorCode.InvalidEndpoint,
                'No endpoint provided for Ollama connection'
            );
        }

        this.apiEndpoint = this.options.endpoint.replace(/\/$/, '');
        const healthCheck = await this.performHealthCheck();
        
        if (healthCheck.status === 'error') {
            throw new LLMConnectionError(
                LLMConnectionErrorCode.ServiceUnavailable,
                healthCheck.error || 'Failed to connect to Ollama service'
            );
        }

        // Update model info if specified
        if (this.options.model) {
            const modelInfo = await this.getModelInfo(this.options.model);
            this.currentStatus.modelInfo = modelInfo;
        }

        // Start periodic health checks
        this.startHealthChecks();
    }

    protected async performHealthCheck(): Promise<HealthCheckResponse> {
        try {
            const response = await fetch(`${this.apiEndpoint}/api/health`, {
                timeout: this.options?.timeout || 5000
            });

            if (!response.ok) {
                return {
                    status: 'error',
                    error: `HTTP ${response.status}: ${response.statusText}`
                };
            }

            const data = await response.json();
            return {
                status: 'ok',
                version: data.version,
                models: data.models
            };
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            return {
                status: 'error',
                error: message
            };
        }
    }

    private async getModelInfo(modelName: string): Promise<ModelInfo> {
        try {
            const response = await fetch(`${this.apiEndpoint}/api/show`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name: modelName }),
                timeout: this.options?.timeout || 5000
            });

            if (!response.ok) {
                throw new LLMConnectionError(
                    LLMConnectionErrorCode.ModelNotFound,
                    `Failed to get info for model ${modelName}`
                );
            }

            const data = await response.json();
            return {
                name: data.name,
                provider: 'ollama',
                endpoint: this.apiEndpoint,
                parameters: data.parameters,
                capabilities: this.inferCapabilities(data)
            };
        } catch (error) {
            if (error instanceof LLMConnectionError) {
                throw error;
            }
            throw new LLMConnectionError(
                LLMConnectionErrorCode.InternalError,
                `Failed to get model info: ${error instanceof Error ? error.message : 'Unknown error'}`
            );
        }
    }

    private inferCapabilities(modelData: any): string[] {
        const capabilities: string[] = ['text-generation'];
        
        // Infer capabilities based on model properties
        if (modelData.parameters?.context_length >= 8192) {
            capabilities.push('long-context');
        }
        if (modelData.tags?.includes('code')) {
            capabilities.push('code-generation');
        }
        if (modelData.tags?.includes('embedding')) {
            capabilities.push('embeddings');
        }

        return capabilities;
    }

    private startHealthChecks(): void {
        // Perform health checks every 30 seconds
        const interval = setInterval(async () => {
            try {
                const health = await this.performHealthCheck();
                if (health.status === 'error') {
                    await this.handleConnectionError(new Error(health.error));
                }
            } catch (error) {
                await this.handleConnectionError(error as Error);
            }
        }, 30000);

        // Add to disposables to ensure cleanup
        this.disposables.push(new vscode.Disposable(() => clearInterval(interval)));
    }

    public override async disconnect(): Promise<void> {
        // Cleanup any Ollama-specific resources here
        await super.disconnect();
    }
}