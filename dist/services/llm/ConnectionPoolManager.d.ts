import { EventEmitter } from 'events';
import { ILLMConnectionProvider } from './interfaces';
/**
 * Configuration for the connection pool
 */
interface PoolConfig {
    maxSize: number;
    minSize: number;
    acquireTimeout: number;
    idleTimeout: number;
    maxWaitingClients: number;
}
/**
 * Manages a pool of LLM connections
 */
export declare class ConnectionPoolManager extends EventEmitter {
    private static instance;
    private readonly pool;
    private readonly inUse;
    private readonly waiting;
    private readonly metricsTracker;
    private readonly config;
    private constructor();
    static getInstance(config?: Partial<PoolConfig>): ConnectionPoolManager;
    /**
     * Acquire a connection from the pool
     */
    acquire(providerId: string): Promise<ILLMConnectionProvider>;
    /**
     * Release a connection back to the pool
     */
    release(providerId: string, connection: ILLMConnectionProvider): void;
    /**
     * Clear all connections for a provider
     */
    clear(providerId: string): Promise<void>;
    /**
     * Get pool statistics
     */
    getStats(providerId: string): {
        available: number;
        inUse: number;
        waiting: number;
        metrics: {
            connectionAttempts: number;
            successfulConnections: number;
            requestCount: number;
            errorCount: number;
            averageLatency: number;
            lastError?: Error;
            lastRequestTime?: number;
        };
    };
    private getOrCreatePool;
    private getOrCreateInUseSet;
    private createConnection;
    private destroyConnection;
    private waitForConnection;
    dispose(): void;
}
export {};
