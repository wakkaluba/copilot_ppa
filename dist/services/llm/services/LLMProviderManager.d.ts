import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderOptions } from '../llmProvider';
import { ProviderType } from '../providers/ProviderFactory';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
import { ConnectionStatusService } from '../../../status/connectionStatusService';
export declare enum ProviderEvent {
    Initialized = "provider:initialized",
    Removed = "provider:removed",
    StatusChanged = "provider:statusChanged",
    MetricsUpdated = "provider:metricsUpdated"
}
export declare class LLMProviderManager extends EventEmitter {
    private readonly connectionService;
    private connectionPool;
    private metrics;
    private activeProviders;
    private defaultProviderId?;
    constructor(connectionService: ConnectionStatusService);
    initializeProvider(type: ProviderType, config: ProviderConfig): Promise<string>;
    getProvider(providerId?: string): Promise<LLMProvider>;
    releaseProvider(provider: LLMProvider): Promise<void>;
    generateCompletion(prompt: string, systemPrompt?: string, options?: LLMProviderOptions): Promise<{
        content: string;
        model: string;
    }>;
    streamCompletion(prompt: string, systemPrompt?: string, options?: LLMProviderOptions, callback?: (event: {
        content: string;
        done: boolean;
    }) => void): Promise<void>;
    private updateMetrics;
    dispose(): Promise<void>;
}
