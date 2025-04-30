import { EventEmitter } from 'events';
import { LLMProvider, LLMProviderStatus } from '../../llm/llm-provider';
import { LLMProviderRegistryService } from './services/LLMProviderRegistryService';
import { ConnectionEventData, HealthCheckResponse, RetryConfig, HealthCheckConfig } from './types';
/**
 * Base class for LLM connection management
 * Provides common functionality for connection handling, health monitoring, and error management
 */
export declare abstract class BaseConnectionManager extends EventEmitter {
    protected activeProvider: LLMProvider | null;
    protected readonly providerRegistry: LLMProviderRegistryService;
    protected currentStatus: LLMProviderStatus;
    private healthCheckInterval;
    protected healthConfig: HealthCheckConfig;
    protected readonly retryConfig: RetryConfig;
    constructor(config?: Partial<RetryConfig & HealthCheckConfig>);
    private setupEventHandlers;
    protected registerProvider(name: string, provider: LLMProvider): void;
    configureProvider(name: string, options?: Record<string, unknown>): Promise<void>;
    protected connect(): Promise<void>;
    protected disconnect(): Promise<void>;
    protected abstract establishConnection(): Promise<void>;
    protected abstract terminateConnection(): Promise<void>;
    protected abstract performHealthCheck(): Promise<HealthCheckResponse>;
    protected handleConnectionError(error: unknown): Promise<void>;
    protected startHealthChecks(): void;
    protected stopHealthChecks(): void;
    protected handleHealthCheckFailure(health: HealthCheckResponse): Promise<void>;
    private handleProviderStatusChange;
    private reconnect;
    private shouldAttemptReconnect;
    protected createConnectionEventData(): ConnectionEventData;
    getStatus(): LLMProviderStatus;
    dispose(): void;
}
