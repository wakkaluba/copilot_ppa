import { EventEmitter } from 'events';
import {
    LLMProvider,
    ProviderConfig,
    ProviderEvent,
    ProviderMetrics,
    LLMResponse,
    LLMMessage,
    LLMRequestOptions,
    LLMStreamEvent
} from '../types';
import { ConnectionPoolManager } from './ConnectionPoolManager';
import { ProviderFactory, ProviderType } from '../providers/ProviderFactory';
import { ConfigurationError, ProviderError } from '../errors';

interface ProviderMetricsData {
    requestCount: number;
    errorCount: number;
    totalLatency: number;
    lastUsed: number;
}

export class LLMProviderManager extends EventEmitter {
    private static instance: LLMProviderManager;
    private connectionPool: ConnectionPoolManager;
    private metrics = new Map<string, ProviderMetricsData>();
    private activeProviders = new Set<string>();
    private defaultProviderId?: string;

    private constructor() {
        super();
        this.connectionPool = new ConnectionPoolManager();
    }

    public static getInstance(): LLMProviderManager {
        if (!LLMProviderManager.instance) {
            LLMProviderManager.instance = new LLMProviderManager();
        }
        return LLMProviderManager.instance;
    }

    public async initializeProvider(
        type: ProviderType,
        config: ProviderConfig
    ): Promise<string> {
        const factory = ProviderFactory.getInstance();
        
        // Create initial provider instance to get ID
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
            timestamp: Date.now()
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

    public async releaseProvider(
        provider: LLMProvider
    ): Promise<void> {
        await this.connectionPool.releaseConnection(provider.id, provider);
    }

    public setDefaultProvider(providerId: string): void {
        if (!this.activeProviders.has(providerId)) {
            throw new ConfigurationError(
                'Provider not active',
                providerId,
                'defaultProvider'
            );
        }
        this.defaultProviderId = providerId;
    }

    public getDefaultProviderId(): string | undefined {
        return this.defaultProviderId;
    }

    public async generateCompletion(
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions & { providerId?: string }
    ): Promise<LLMResponse> {
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

    public async generateChatCompletion(
        messages: LLMMessage[],
        options?: LLMRequestOptions & { providerId?: string }
    ): Promise<LLMResponse> {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();

        try {
            const response = await provider.generateChatCompletion(
                options?.model || 'default',
                messages,
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
        options?: LLMRequestOptions & { providerId?: string },
        callback?: (event: LLMStreamEvent) => void
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

    public async streamChatCompletion(
        messages: LLMMessage[],
        options?: LLMRequestOptions & { providerId?: string },
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void> {
        const provider = await this.getProvider(options?.providerId);
        const start = Date.now();

        try {
            await provider.streamChatCompletion(
                options?.model || 'default',
                messages,
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

    private updateMetrics(
        providerId: string,
        latency: number,
        isError: boolean = false
    ): void {
        const metrics = this.metrics.get(providerId);
        if (!metrics) return;

        metrics.requestCount++;
        metrics.totalLatency += latency;
        if (isError) metrics.errorCount++;
        metrics.lastUsed = Date.now();
    }

    public getMetrics(providerId: string): ProviderMetrics {
        const metrics = this.metrics.get(providerId);
        if (!metrics) {
            throw new ProviderError('Provider not found', providerId);
        }

        return {
            requestCount: metrics.requestCount,
            errorCount: metrics.errorCount,
            averageLatency: metrics.requestCount > 0 
                ? metrics.totalLatency / metrics.requestCount 
                : 0,
            successRate: metrics.requestCount > 0
                ? (metrics.requestCount - metrics.errorCount) / metrics.requestCount
                : 1,
            lastUsed: metrics.lastUsed
        };
    }

    public getActiveProviders(): string[] {
        return Array.from(this.activeProviders);
    }

    public async dispose(): Promise<void> {
        await this.connectionPool.dispose();
        this.activeProviders.clear();
        this.metrics.clear();
        this.defaultProviderId = undefined;
        this.removeAllListeners();
    }
}