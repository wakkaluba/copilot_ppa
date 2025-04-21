import { EventEmitter } from 'events';
import { ILLMConnectionProvider, ConnectionErrorCode } from './interfaces';
import { LLMConnectionError } from './errors';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';

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
 * Default pool configuration
 */
const DEFAULT_POOL_CONFIG: PoolConfig = {
    maxSize: 5,
    minSize: 1,
    acquireTimeout: 30000,
    idleTimeout: 60000,
    maxWaitingClients: 10
};

/**
 * Manages a pool of LLM connections
 */
export class ConnectionPoolManager extends EventEmitter {
    private static instance: ConnectionPoolManager;
    private readonly pool: Map<string, ILLMConnectionProvider[]> = new Map();
    private readonly inUse: Map<string, Set<ILLMConnectionProvider>> = new Map();
    private readonly waiting: Map<string, Array<{
        resolve: (connection: ILLMConnectionProvider) => void;
        reject: (error: Error) => void;
        timeout: NodeJS.Timeout;
    }>> = new Map();
    private readonly metricsTracker: ConnectionMetricsTracker;
    private readonly config: PoolConfig;

    private constructor(config: Partial<PoolConfig> = {}) {
        super();
        this.config = { ...DEFAULT_POOL_CONFIG, ...config };
        this.metricsTracker = new ConnectionMetricsTracker();
    }

    public static getInstance(config?: Partial<PoolConfig>): ConnectionPoolManager {
        if (!this.instance) {
            this.instance = new ConnectionPoolManager(config);
        }
        return this.instance;
    }

    /**
     * Acquire a connection from the pool
     */
    public async acquire(providerId: string): Promise<ILLMConnectionProvider> {
        const available = this.pool.get(providerId) || [];
        const inUse = this.getOrCreateInUseSet(providerId);

        // Check for available connection
        if (available.length > 0) {
            const connection = available.pop()!;
            inUse.add(connection);
            return connection;
        }

        // Check if we can create a new connection
        if (inUse.size < this.config.maxSize) {
            const connection = await this.createConnection(providerId);
            inUse.add(connection);
            return connection;
        }

        // Wait for a connection if possible
        return this.waitForConnection(providerId);
    }

    /**
     * Release a connection back to the pool
     */
    public release(providerId: string, connection: ILLMConnectionProvider): void {
        const inUse = this.inUse.get(providerId);
        if (!inUse?.has(connection)) {
            return;
        }

        inUse.delete(connection);

        // Check waiting clients first
        const waiting = this.waiting.get(providerId) || [];
        if (waiting.length > 0) {
            const next = waiting.shift()!;
            clearTimeout(next.timeout);
            inUse.add(connection);
            next.resolve(connection);
            return;
        }

        // Add to available pool or destroy if above minSize
        const available = this.getOrCreatePool(providerId);
        if (available.length < this.config.minSize) {
            available.push(connection);
        } else {
            this.destroyConnection(connection).catch(console.error);
        }
    }

    /**
     * Clear all connections for a provider
     */
    public async clear(providerId: string): Promise<void> {
        const available = this.pool.get(providerId) || [];
        const inUse = this.inUse.get(providerId) || new Set();
        const waiting = this.waiting.get(providerId) || [];

        // Reject waiting clients
        waiting.forEach(({ reject, timeout }) => {
            clearTimeout(timeout);
            reject(new Error('Pool cleared'));
        });
        this.waiting.delete(providerId);

        // Destroy all connections
        await Promise.all([
            ...available.map(conn => this.destroyConnection(conn)),
            ...[...inUse].map(conn => this.destroyConnection(conn))
        ]);

        this.pool.delete(providerId);
        this.inUse.delete(providerId);
    }

    /**
     * Get pool statistics
     */
    public getStats(providerId: string) {
        return {
            available: this.pool.get(providerId)?.length || 0,
            inUse: this.inUse.get(providerId)?.size || 0,
            waiting: this.waiting.get(providerId)?.length || 0,
            metrics: this.metricsTracker.getMetrics()
        };
    }

    private getOrCreatePool(providerId: string): ILLMConnectionProvider[] {
        if (!this.pool.has(providerId)) {
            this.pool.set(providerId, []);
        }
        return this.pool.get(providerId)!;
    }

    private getOrCreateInUseSet(providerId: string): Set<ILLMConnectionProvider> {
        if (!this.inUse.has(providerId)) {
            this.inUse.set(providerId, new Set());
        }
        return this.inUse.get(providerId)!;
    }

    private async createConnection(providerId: string): Promise<ILLMConnectionProvider> {
        try {
            // This would need to be implemented based on how connections are created
            throw new Error('Connection creation not implemented');
        } catch (error) {
            this.metricsTracker.recordRequestFailure(
                error instanceof Error ? error : new Error(String(error))
            );
            throw new LLMConnectionError(
                ConnectionErrorCode.CONNECTION_FAILED,
                'Failed to create connection',
                error instanceof Error ? error : undefined
            );
        }
    }

    private async destroyConnection(connection: ILLMConnectionProvider): Promise<void> {
        try {
            await connection.disconnect();
        } catch (error) {
            console.error('Error destroying connection:', error);
        }
    }

    private waitForConnection(providerId: string): Promise<ILLMConnectionProvider> {
        const waiting = this.waiting.get(providerId) || [];
        
        if (waiting.length >= this.config.maxWaitingClients) {
            throw new LLMConnectionError(
                ConnectionErrorCode.CONNECTION_FAILED,
                'Too many waiting clients'
            );
        }

        if (!this.waiting.has(providerId)) {
            this.waiting.set(providerId, []);
        }

        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                const index = waiting.findIndex(w => w.timeout === timeout);
                if (index !== -1) {
                    waiting.splice(index, 1);
                }
                reject(new LLMConnectionError(
                    ConnectionErrorCode.TIMEOUT,
                    'Connection acquisition timeout'
                ));
            }, this.config.acquireTimeout);

            waiting.push({ resolve, reject, timeout });
        });
    }

    public dispose(): void {
        // Clear all pools
        Promise.all(
            Array.from(this.pool.keys()).map(id => this.clear(id))
        ).catch(console.error);
        
        this.removeAllListeners();
    }
}