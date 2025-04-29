import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderOptions } from '../llmProvider';
import { ConnectionPoolManager } from './ConnectionPoolManager';
import { ProviderFactory, ProviderType } from '../providers/ProviderFactory';
import { ConfigurationError, ProviderError } from '../errors';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
import { ConnectionStatusService, ConnectionState } from '../../../status/connectionStatusService';

export enum ProviderEvent {
    Initialized = 'provider:initialized',
    Removed = 'provider:removed',
    StatusChanged = 'provider:statusChanged',
    MetricsUpdated = 'provider:metricsUpdated'
}

interface ProviderMetricsData {
    requestCount: number;
    errorCount: number;
    totalLatency: number;
    lastUsed: number;
}

export class LLMProviderManager extends EventEmitter {
    private connectionPool: ConnectionPoolManager;
    private metrics = new Map<string, ProviderMetricsData>();
    private activeProviders = new Set<string>();
    private defaultProviderId?: string;

    constructor(
        private readonly connectionService: ConnectionStatusService
    ) {
        super();
        this.connectionPool = new ConnectionPoolManager();
    }

    public async initializeProvider(
        type: ProviderType,
        config: ProviderConfig
    ): Promise<string> {
        const factory = ProviderFactory.getInstance();
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

    public async getProvider(providerId?: string): Promise<LLMProvider> {
        const targetId = providerId || this.defaultProviderId;
        if (!targetId) {
            throw new ProviderError('No provider available', 'unknown');
        }

        if (!this.activeProviders.has(targetId)) {
            throw new ProviderError('Provider not active', targetId);
        }

        return this.connectionPool.acquireConnection(targetId);
    }

    public async releaseProvider(provider: LLMProvider): Promise<void> {
        await this.connectionPool.releaseConnection(provider.id, provider);
    }

    public async generateCompletion(
        prompt: string,
        systemPrompt?: string,
        options?: LLMProviderOptions
    ): Promise<{ content: string; model: string; }> {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();

        try {
            const response = await provider.generateCompletion(
                options?.model || 'default',
                prompt,
                systemPrompt,
                options
            );
            this.updateMetrics(provider.id, Date.now() - start);
            return response;
        } catch (error) {
            this.updateMetrics(provider.id, Date.now() - start, true);
            throw error;
        } finally {
            await this.releaseProvider(provider);
        }
    }

    public async streamCompletion(
        prompt: string,
        systemPrompt?: string,
        options?: LLMProviderOptions,
        callback?: (event: { content: string; done: boolean }) => void
    ): Promise<void> {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();

        try {
            await provider.streamCompletion(
                options?.model || 'default',
                prompt,
                systemPrompt,
                options,
                callback
            );
            this.updateMetrics(provider.id, Date.now() - start);
        } catch (error) {
            this.updateMetrics(provider.id, Date.now() - start, true);
            throw error;
        } finally {
            await this.releaseProvider(provider);
        }
    }

    private updateMetrics(providerId: string, latency: number, isError = false): void {
        const metrics = this.metrics.get(providerId);
        if (!metrics) return;

        metrics.requestCount++;
        metrics.totalLatency += latency;
        if (isError) {
            metrics.errorCount++;
        }
        metrics.lastUsed = Date.now();
    }

    public async dispose(): Promise<void> {
        await this.connectionPool.dispose();
        this.activeProviders.clear();
        this.metrics.clear();
        this.defaultProviderId = undefined;
        this.removeAllListeners();
    }
}