import { EventEmitter } from 'events';
import { 
    LLMProvider,
    LLMModelInfo,
    LLMProviderError,
    LLMProviderStatus
} from '../../llm/llm-provider';

export interface ConnectionMetrics {
    latency: number;
    uptime: number;
    requestCount: number;
    errorCount: number;
    lastError?: string;
    lastSuccess?: Date;
}

export interface ProviderDescriptor {
    name: string;
    isAvailable: boolean;
    supportedModels: string[];
    metadata?: Record<string, unknown>;
}

/**
 * Base class for managing LLM provider connections
 */
export abstract class BaseConnectionManager extends EventEmitter {
    protected activeProvider: LLMProvider | null = null;
    protected providers: Map<string, LLMProvider> = new Map();
    protected connectionMetrics: Map<string, ConnectionMetrics> = new Map();
    protected healthCheckInterval: NodeJS.Timeout | null = null;
    protected readonly healthCheckPeriod = 30000; // 30 seconds
    protected startTime: number = Date.now();

    constructor() {
        super();
        this.setupHealthCheck();
    }

    /**
     * Register a provider with the manager
     */
    protected registerProvider(name: string, provider: LLMProvider): void {
        this.providers.set(name.toLowerCase(), provider);
        this.initializeMetrics(name);
        
        // Forward provider events
        provider.on('statusChanged', (status) => {
            this.handleProviderStatusChange(name, status);
        });
    }

    /**
     * Configure a provider for use
     */
    public async configureProvider(name: string, options?: Record<string, unknown>): Promise<void> {
        const provider = this.providers.get(name.toLowerCase());
        if (!provider) {
            throw new LLMProviderError(
                'INVALID_PROVIDER',
                `Provider ${name} not found`
            );
        }

        try {
            // Initialize the provider if needed
            if ('initialize' in provider && typeof provider.initialize === 'function') {
                await provider.initialize(options);
            }

            this.activeProvider = provider;
            this.emit('providerConfigured', { name, provider });
        } catch (error) {
            this.recordError(name, error);
            throw this.normalizeError(error);
        }
    }

    /**
     * Get available providers and their status
     */
    public async getAvailableProviders(): Promise<ProviderDescriptor[]> {
        const descriptors: ProviderDescriptor[] = [];
        
        for (const [name, provider] of this.providers) {
            try {
                const isAvailable = await provider.isAvailable();
                const models = isAvailable ? await provider.getAvailableModels() : [];
                
                descriptors.push({
                    name,
                    isAvailable,
                    supportedModels: models.map(m => m.id),
                    metadata: this.connectionMetrics.get(name)
                });
            } catch (error) {
                this.recordError(name, error);
                descriptors.push({
                    name,
                    isAvailable: false,
                    supportedModels: []
                });
            }
        }
        
        return descriptors;
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

        const startTime = Date.now();
        try {
            await this.activeProvider.connect();
            this.recordSuccess(this.activeProvider.name, startTime);
        } catch (error) {
            this.recordError(this.activeProvider.name, error);
            throw this.normalizeError(error);
        }
    }

    /**
     * Disconnect from the active provider
     */
    public async disconnect(): Promise<void> {
        if (!this.activeProvider) return;

        try {
            await this.activeProvider.disconnect();
        } catch (error) {
            this.recordError(this.activeProvider.name, error);
            throw this.normalizeError(error);
        }
    }

    /**
     * Get the current connection status
     */
    public getStatus(): LLMProviderStatus {
        if (!this.activeProvider) {
            return {
                isAvailable: false,
                isConnected: false,
                error: 'No active provider'
            };
        }

        const status = this.activeProvider.getStatus();
        const metrics = this.connectionMetrics.get(this.activeProvider.name);
        
        return {
            ...status,
            metadata: {
                ...status.metadata,
                metrics
            }
        };
    }

    /**
     * Get connection metrics for a provider
     */
    public getMetrics(providerName?: string): ConnectionMetrics | null {
        const name = providerName?.toLowerCase() || this.activeProvider?.name.toLowerCase();
        if (!name) return null;
        return this.connectionMetrics.get(name) || null;
    }

    /**
     * Initialize metrics for a provider
     */
    protected initializeMetrics(providerName: string): void {
        this.connectionMetrics.set(providerName.toLowerCase(), {
            latency: 0,
            uptime: 0,
            requestCount: 0,
            errorCount: 0
        });
    }

    /**
     * Record a successful operation
     */
    protected recordSuccess(providerName: string, startTime: number): void {
        const metrics = this.connectionMetrics.get(providerName.toLowerCase());
        if (!metrics) return;

        metrics.requestCount++;
        metrics.latency = Date.now() - startTime;
        metrics.lastSuccess = new Date();
        metrics.uptime = Date.now() - this.startTime;
    }

    /**
     * Record an error
     */
    protected recordError(providerName: string, error: unknown): void {
        const metrics = this.connectionMetrics.get(providerName.toLowerCase());
        if (!metrics) return;

        metrics.errorCount++;
        metrics.lastError = error instanceof Error ? error.message : String(error);
    }

    /**
     * Set up periodic health checks
     */
    protected setupHealthCheck(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }

        this.healthCheckInterval = setInterval(() => {
            this.runHealthCheck().catch(() => {
                // Errors are handled within runHealthCheck
            });
        }, this.healthCheckPeriod);
    }

    /**
     * Run a health check on the active provider
     */
    protected async runHealthCheck(): Promise<void> {
        if (!this.activeProvider) return;

        try {
            const startTime = Date.now();
            const status = await this.activeProvider.isAvailable();
            
            if (status) {
                this.recordSuccess(this.activeProvider.name, startTime);
            } else {
                throw new Error('Provider reported as unavailable');
            }
        } catch (error) {
            this.recordError(this.activeProvider.name, error);
            this.emit('healthCheckFailed', {
                provider: this.activeProvider.name,
                error: this.normalizeError(error)
            });
        }
    }

    /**
     * Handle provider status changes
     */
    protected handleProviderStatusChange(providerName: string, status: LLMProviderStatus): void {
        if (this.activeProvider?.name.toLowerCase() === providerName.toLowerCase()) {
            this.emit('stateChanged', status);
        }
    }

    /**
     * Normalize an error to LLMProviderError
     */
    protected normalizeError(error: unknown): LLMProviderError {
        if (error instanceof LLMProviderError) {
            return error;
        }
        return new LLMProviderError(
            'PROVIDER_ERROR',
            error instanceof Error ? error.message : String(error),
            error
        );
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.disconnect().catch(() => {}); // Ignore errors during disposal
        this.removeAllListeners();
    }
}