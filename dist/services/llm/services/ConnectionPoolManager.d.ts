import { LLMProvider } from '../llmProvider';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
import { EventEmitter } from 'events';
export declare class ConnectionPoolManager extends EventEmitter {
    private pools;
    private maxPoolSize;
    private idleTimeout;
    constructor();
    initializeProvider(providerId: string, config: ProviderConfig): Promise<void>;
    acquireConnection(providerId: string): Promise<LLMProvider>;
    releaseConnection(providerId: string, provider: LLMProvider): Promise<void>;
    private startIdleCleanup;
    dispose(): Promise<void>;
}
