import { EventEmitter } from 'events';
import { Logger } from '../../utils/logger';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';
import { LLMConnectionError } from './errors';
import { ConnectionErrorCode, ILLMConnectionProvider } from './interfaces';

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
    private readonly logger = Logger.getInstance();

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
        try {
            if (available.length > 0) {
                const connection = available.pop()!;
                inUse.add(connection);
                this.logger.info?.(`Connection acquired from pool for provider ${providerId}`);
                return connection;
            }
            if (inUse.size < this.config.maxSize) {
                const connection = await this.createConnection(providerId);
                inUse.add(connection);
                this.logger.info?.(`New connection created for provider ${providerId}`);
                return connection;
            }
            this.logger.warn?.(`Waiting for connection for provider ${providerId}`);
            return this.waitForConnection(providerId);
        } catch (error) {
            this.logger.error('Error acquiring connection', { error, providerId });
            throw new LLMConnectionError('PoolAcquireError', `Failed to acquire connection for provider ${providerId}`);
        }
    }

    /**
     * Release a connection back to the pool
     */
    public release(providerId: string, connection: ILLMConnectionProvider): void {
        const inUse = this.inUse.get(providerId);
        if (!inUse?.has(connection)) {
            this.logger.warn?.(`Attempted to release unknown connection for provider ${providerId}`);
            return;
        }
        inUse.delete(connection);
        const waiting = this.waiting.get(providerId) || [];
        if (waiting.length > 0) {
            const next = waiting.shift()!;
            clearTimeout(next.timeout);
            inUse.add(connection);
            next.resolve(connection);
            this.logger.info?.(`Connection handed off to waiting client for provider ${providerId}`);
        } else {
            const pool = this.pool.get(providerId) || [];
            pool.push(connection);
            this.pool.set(providerId, pool);
            this.logger.info?.(`Connection released back to pool for provider ${providerId}`);
        }
    }

    /**
     * Clear all connections for a provider
     */
    public async clear(providerId: string): Promise<void> {
        try {
            this.pool.delete(providerId);
            this.inUse.delete(providerId);
            this.waiting.delete(providerId);
            this.logger.info?.(`Cleared all connections for provider ${providerId}`);
        } catch (error) {
            this.logger.error('Error clearing connection pool', { error, providerId });
            throw new LLMConnectionError('PoolClearError', `Failed to clear pool for provider ${providerId}`);
        }
    }

    /**
     * Get pool statistics
     */
    public getStats(providerId: string): Record<string, unknown> {
        return {
            poolSize: this.pool.get(providerId)?.length || 0,
            inUse: this.inUse.get(providerId)?.size || 0,
            waiting: this.waiting.get(providerId)?.length || 0
        };
    }

    public dispose(): void {
        this.pool.clear();
        this.inUse.clear();
        this.waiting.clear();
        this.logger.info?.('ConnectionPoolManager disposed');
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
            throw new LLMConnectionError(
                ConnectionErrorCode.NOT_IMPLEMENTED,
                `Connection creation not implemented for provider: ${providerId}`
            );
        } catch (error) {
            this.metricsTracker.recordRequestFailure(
                error instanceof Error ? error : new Error(String(error))
            );
            this.logger.error('Failed to create connection', { providerId, error });
            throw new LLMConnectionError(
                ConnectionErrorCode.CONNECTION_FAILED,
                `Failed to create connection for provider: ${providerId}`,
                error instanceof Error ? error : undefined
            );
        }
    }

    private async destroyConnection(connection: ILLMConnectionProvider): Promise<void> {
        try {
            await connection.disconnect();
        } catch (error) {
            this.logger.error('Error destroying connection', { error });
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
}
