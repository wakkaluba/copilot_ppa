import { EventEmitter } from 'events';
import { LLMProvider, ProviderConfig } from '../types';
export declare class ConnectionPoolManager extends EventEmitter {
    private pools;
    private healthChecks;
    initializeProvider(providerId: string, config: ProviderConfig): Promise<void>;
    private startHealthCheck;
    acquireConnection(providerId: string): Promise<LLMProvider>;
    releaseConnection(providerId: string, connection: LLMProvider): Promise<void>;
    disposeProvider(providerId: string): Promise<void>;
    dispose(): void;
}
