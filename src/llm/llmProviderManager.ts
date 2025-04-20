import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ConnectionState, ConnectionStatusService } from '../status/connectionStatusService';
import { LLMProvider, LLMProviderError, LLMModelInfo } from './llm-provider';
import { OllamaProvider } from './ollama-provider';
import { LMStudioProvider } from './lmstudio-provider';

interface ProviderConfig {
    type: string;
    endpoint?: string;
    model?: string;
    options?: Record<string, unknown>;
}

export interface ManagerStatus {
    state: ConnectionState;
    activeProvider?: string;
    activeModel?: string;
    error?: string;
}

/**
 * Manages LLM providers, their lifecycle, and connections
 */
export class LLMProviderManager extends EventEmitter implements vscode.Disposable {
    private providers = new Map<string, LLMProvider>();
    private activeProvider: LLMProvider | null = null;
    private modelInfo = new Map<string, LLMModelInfo>();
    private readonly statusService: ConnectionStatusService;
    private reconnectInterval: NodeJS.Timeout | null = null;
    private reconnectAttempts = 0;
    private readonly maxReconnectAttempts = 5;

    constructor(statusService: ConnectionStatusService) {
        super();
        this.statusService = statusService;
        this.initializeDefaultProviders();
    }

    /**
     * Initialize default LLM providers
     */
    private initializeDefaultProviders(): void {
        this.registerProvider('ollama', new OllamaProvider());
        this.registerProvider('lmstudio', new LMStudioProvider());
    }

    /**
     * Register a new provider
     */
    public registerProvider(type: string, provider: LLMProvider): void {
        this.providers.set(type.toLowerCase(), provider);
        provider.on('statusChanged', (status) => this.handleProviderStatusChange(type, status));
    }

    /**
     * Configure and initialize a provider
     */
    public async configureProvider(config: ProviderConfig): Promise<void> {
        const provider = this.providers.get(config.type.toLowerCase());
        if (!provider) {
            throw new LLMProviderError(
                'INVALID_PROVIDER',
                `Provider ${config.type} not found`
            );
        }

        // Update status while configuring
        this.updateStatus({
            state: ConnectionState.Configuring,
            activeProvider: config.type,
            activeModel: config.model
        });

        try {
            // Initialize the provider with configuration
            if ('initialize' in provider && typeof provider.initialize === 'function') {
                await provider.initialize(config);
            }

            // Set as active provider
            this.activeProvider = provider;

            // Update status after successful configuration
            this.updateStatus({
                state: ConnectionState.Configured,
                activeProvider: config.type,
                activeModel: config.model
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Connect to the active provider
     */
    public async connect(): Promise<void> {
        if (!this.activeProvider) {
            throw new LLMProviderError(
                'NO_ACTIVE_PROVIDER',
                'No provider is currently active'
            );
        }

        this.updateStatus({
            state: ConnectionState.Connecting
        });

        try {
            await this.activeProvider.connect();
            this.reconnectAttempts = 0;
            this.startHealthCheck();

            this.updateStatus({
                state: ConnectionState.Connected
            });
        } catch (error) {
            this.handleError(error);
            await this.handleConnectionFailure();
        }
    }

    /**
     * Disconnect from the active provider
     */
    public async disconnect(): Promise<void> {
        if (!this.activeProvider) return;

        this.stopHealthCheck();
        
        try {
            await this.activeProvider.disconnect();
            this.updateStatus({
                state: ConnectionState.Disconnected
            });
        } catch (error) {
            this.handleError(error);
        }
    }

    /**
     * Get the active provider
     */
    public getActiveProvider(): LLMProvider | null {
        return this.activeProvider;
    }

    /**
     * Get available models for the active provider
     */
    public async getAvailableModels(): Promise<LLMModelInfo[]> {
        if (!this.activeProvider) {
            throw new LLMProviderError(
                'NO_ACTIVE_PROVIDER',
                'No provider is currently active'
            );
        }

        try {
            const models = await this.activeProvider.getAvailableModels();
            models.forEach(model => this.modelInfo.set(model.id, model));
            return models;
        } catch (error) {
            this.handleError(error);
            return [];
        }
    }

    /**
     * Get information about a specific model
     */
    public async getModelInfo(modelId: string): Promise<LLMModelInfo | undefined> {
        // Check cache first
        if (this.modelInfo.has(modelId)) {
            return this.modelInfo.get(modelId);
        }

        if (!this.activeProvider) {
            throw new LLMProviderError(
                'NO_ACTIVE_PROVIDER',
                'No provider is currently active'
            );
        }

        try {
            const info = await this.activeProvider.getModelInfo(modelId);
            this.modelInfo.set(modelId, info);
            return info;
        } catch (error) {
            this.handleError(error);
            return undefined;
        }
    }

    /**
     * Start periodic health checks
     */
    private startHealthCheck(): void {
        this.stopHealthCheck(); // Clear any existing interval
        this.reconnectInterval = setInterval(async () => {
            if (!this.activeProvider) return;

            try {
                const status = this.activeProvider.getStatus();
                if (!status.isConnected) {
                    throw new Error('Provider disconnected');
                }
            } catch (error) {
                await this.handleConnectionFailure();
            }
        }, 30000); // Check every 30 seconds
    }

    /**
     * Stop health checks
     */
    private stopHealthCheck(): void {
        if (this.reconnectInterval) {
            clearInterval(this.reconnectInterval);
            this.reconnectInterval = null;
        }
    }

    /**
     * Handle provider status changes
     */
    private handleProviderStatusChange(providerType: string, status: any): void {
        if (this.activeProvider && this.providers.get(providerType) === this.activeProvider) {
            this.updateStatus({
                state: status.isConnected ? ConnectionState.Connected : ConnectionState.Disconnected,
                error: status.error
            });
        }
    }

    /**
     * Handle connection failures and implement retry logic
     */
    private async handleConnectionFailure(): Promise<void> {
        this.reconnectAttempts++;
        
        if (this.reconnectAttempts <= this.maxReconnectAttempts) {
            this.updateStatus({
                state: ConnectionState.Reconnecting,
                error: `Connection lost. Attempt ${this.reconnectAttempts} of ${this.maxReconnectAttempts}`
            });

            // Exponential backoff
            const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts - 1), 30000);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            try {
                await this.connect();
            } catch (error) {
                // Error handling is done in connect()
            }
        } else {
            this.updateStatus({
                state: ConnectionState.Error,
                error: 'Maximum reconnection attempts reached'
            });
            this.stopHealthCheck();
        }
    }

    /**
     * Update manager status and notify listeners
     */
    private updateStatus(updates: Partial<ManagerStatus>): void {
        this.statusService.setState(
            updates.state || ConnectionState.Unknown,
            {
                modelName: updates.activeModel || '',
                providerName: updates.activeProvider || '',
                error: updates.error
            }
        );
        this.emit('statusChanged', updates);
    }

    /**
     * Handle and normalize errors
     */
    private handleError(error: unknown): never {
        const normalizedError = error instanceof LLMProviderError ? error :
            new LLMProviderError(
                'PROVIDER_ERROR',
                error instanceof Error ? error.message : String(error),
                error
            );

        this.updateStatus({
            state: ConnectionState.Error,
            error: normalizedError.message
        });

        throw normalizedError;
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.stopHealthCheck();
        this.disconnect().catch(() => {}); // Ignore errors during disposal
        this.removeAllListeners();
    }
}