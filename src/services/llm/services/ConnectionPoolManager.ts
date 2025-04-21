import { EventEmitter } from 'events';
import { ILLMConnectionProvider, ConnectionErrorCode } from '../interfaces';
import { LLMConnectionError } from '../errors';
import { ConnectionMetricsTracker } from '../ConnectionMetricsTracker';
import { LLMRetryManagerService } from './LLMRetryManagerService';

interface PoolConfig {
    maxSize: number;
    minSize: number;
    acquireTimeout: number;
    idleTimeout: number;
    maxWaitingClients: number;
}

const DEFAULT_POOL_CONFIG: PoolConfig = {
    maxSize: 5,
    minSize: 1,
    acquireTimeout: 30000,
    idleTimeout: 60000,
    maxWaitingClients: 10
};

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
    private readonly retryManager: LLMRetryManagerService;
    private readonly config: PoolConfig;
    private maintenanceInterval: NodeJS.Timeout | null = null;

    private constructor(config: Partial<PoolConfig> = {}) {
        super();
        this.config = { ...DEFAULT_POOL_CONFIG, ...config };
        this.metricsTracker = new ConnectionMetricsTracker();
        this.retryManager = new LLMRetryManagerService();
        this.startMaintenance();
    }

    public static getInstance(config?: Partial<PoolConfig>): ConnectionPoolManager {
        if (!this.instance) {
            this.instance = new ConnectionPoolManager(config);
        }
        return this.instance;
    }

    public async acquire(providerId: string): Promise<ILLMConnectionProvider> {
        const available = this.pool.get(providerId) || [];
        const inUse = this.getOrCreateInUseSet(providerId);

        // Try to get a connection from the available pool
        while (available.length > 0) {
            const connection = available.pop()!;
            try {
                // Validate connection is still healthy
                const health = await connection.healthCheck();
                if (health.status === 'ok') {
                    inUse.add(connection);
                    this.metricsTracker.recordRequest();
                    return connection;
                }
                // Connection is unhealthy, destroy it
                await this.destroyConnection(connection);
            } catch (error) {
                await this.destroyConnection(connection);
            }
        }

        // Create new connection if pool isn't at max capacity
        if (inUse.size < this.config.maxSize) {
            try {
                const connection = await this.createConnection(providerId);
                inUse.add(connection);
                this.metricsTracker.recordRequest();
                return connection;
            } catch (error) {
                const retryResult = await this.retryManager.handleRetry(async () => {
                    const conn = await this.createConnection(providerId);
                    inUse.add(conn);
                    return conn;
                });

                if (retryResult.success) {
                    return retryResult.result!;
                }
                throw error;
            }
        }

        // Wait for a connection if we're at capacity
        return this.waitForConnection(providerId);
    }

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

    public async clear(providerId: string): Promise<void> {
        const available = this.pool.get(providerId) || [];
        const inUse = this.inUse.get(providerId) || new Set();
        const waiting = this.waiting.get(providerId) || [];

        // Reject waiting clients
        waiting.forEach(({ reject, timeout }) => {
            clearTimeout(timeout);
            reject(new LLMConnectionError(
                ConnectionErrorCode.CONNECTION_FAILED,
                'Pool cleared'
            ));
        });
        this.waiting.delete(providerId);

        // Destroy all connections
        await Promise.all([
            ...available.map(conn => this.destroyConnection(conn)),
            ...[...inUse].map(conn => this.destroyConnection(conn))
        ]);

        this.pool.delete(providerId);
        this.inUse.delete(providerId);
        this.metricsTracker.reset(providerId);
    }

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
            const provider = await import('../providers/' + providerId).then(m => new m.default());
            await provider.initialize();
            this.metricsTracker.recordConnectionCreated(providerId);
            return provider;
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

    private startMaintenance(): void {
        this.maintenanceInterval = setInterval(() => {
            this.performMaintenance().catch(console.error);
        }, this.config.idleTimeout);
    }

    private async performMaintenance(): Promise<void> {
        const now = Date.now();

        for (const [providerId, connections] of this.pool.entries()) {
            const available = connections.slice();
            const toRemove: ILLMConnectionProvider[] = [];

            // Check each available connection
            for (const connection of available) {
                try {
                    const health = await connection.healthCheck();
                    if (health.status !== 'ok') {
                        toRemove.push(connection);
                    }
                } catch (error) {
                    toRemove.push(connection);
                }
            }

            // Remove unhealthy connections
            for (const connection of toRemove) {
                const index = connections.indexOf(connection);
                if (index !== -1) {
                    connections.splice(index, 1);
                    await this.destroyConnection(connection);
                }
            }

            // Maintain minimum pool size
            while (connections.length < this.config.minSize) {
                try {
                    const connection = await this.createConnection(providerId);
                    connections.push(connection);
                } catch (error) {
                    console.error(`Failed to maintain minimum pool size for ${providerId}:`, error);
                    break;
                }
            }
        }
    }

    public dispose(): void {
        if (this.maintenanceInterval) {
            clearInterval(this.maintenanceInterval);
        }

        // Clear all pools
        Promise.all(
            Array.from(this.pool.keys()).map(id => this.clear(id))
        ).catch(console.error);
        
        this.retryManager.dispose();
        this.removeAllListeners();
    }
}