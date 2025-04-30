import { LLMProvider } from '../types';
import { HealthCheckResult } from '../interfaces';
export declare class ProviderConnectionPool {
    private connections;
    private maxSize;
    constructor(maxSize: number);
    acquire(): Promise<LLMProvider>;
    release(provider: LLMProvider): Promise<void>;
    checkHealth(): Promise<HealthCheckResult>;
    private createConnection;
    dispose(): Promise<void>;
}
