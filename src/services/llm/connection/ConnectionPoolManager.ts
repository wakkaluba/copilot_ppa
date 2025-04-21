import { EventEmitter } from 'events';
import {
    ProviderConfig,
    ProviderConnectionState,
    ProviderError
} from '../types';

interface PoolConfig {
    minConnections: number;
    maxConnections: number;
    idleTimeoutMs: number;
    healthCheckIntervalMs: number;
}

interface PooledConnection {
    id: string;
    state: ProviderConnectionState;
    lastUsed: number;
    errorCount: number;
    lastError?: Error;
}

interface ConnectionPool {
    config: PoolConfig;
    connections: Map<string, PooledConnection>;
    activeCount: number;
}

interface PoolHealth {
    isHealthy: boolean;
    activeConnections: number;
    errorRate: number;
    lastError?: Error;
}

export class ConnectionPoolManager extends EventEmitter {
    private readonly pools = new Map<string, ConnectionPool>();
    private readonly defaultConfig: PoolConfig = {
        minConnections: 1,
        maxConnections: 5,
        idleTimeoutMs: 300000, // 5 minutes
        healthCheckIntervalMs: 30000 // 30 seconds
    };
    private healthCheckIntervals = new Map<string, NodeJS.Timeout>();

    /**
     * Initialize a connection pool for a provider
     */
    public async initializeProvider(
        providerId: string,
        config: ProviderConfig
    ): Promise<void> {
        if (this.pools.has(providerId)) {
            return;
        }

        const poolConfig = this.createPoolConfig(config);
        const pool: ConnectionPool = {
            config: poolConfig,
            connections: new Map(),
            activeCount: 0
        };

        // Initialize minimum connections
        for (let i = 0; i < poolConfig.minConnections; i++) {
            const connection = this.createConnection();
            pool.connections.set(connection.id, connection);
        }

        this.pools.set(providerId, pool);

        // Start health checks
        this.startHealthChecks(providerId);
    }

    /**
     * Initialize connections for a provider
     */
    public async initializeConnections(
        providerId: string,
        config: ProviderConfig
    ): Promise<void> {
        const pool = this.pools.get(providerId);
        if (!pool) {
            throw new ProviderError('Provider pool not found', providerId);
        }

        // Reset all connections
        pool.connections.clear();
        pool.activeCount = 0;

        // Initialize minimum connections
        for (let i = 0; i < pool.config.minConnections; i++) {
            const connection = this.createConnection();
            pool.connections.set(connection.id, connection);
        }

        this.emit('connectionStateChanged', {
            providerId,
            state: ProviderConnectionState.Connected
        });
    }

    /**
     * Close all connections for a provider
     */
    public async closeConnections(providerId: string): Promise<void> {
        const pool = this.pools.get(providerId);
        if (!pool) return;

        // Stop health checks
        const interval = this.healthCheckIntervals.get(providerId);
        if (interval) {
            clearInterval(interval);
            this.healthCheckIntervals.delete(providerId);
        }

        // Clear all connections
        pool.connections.clear();
        pool.activeCount = 0;

        this.pools.delete(providerId);

        this.emit('connectionStateChanged', {
            providerId,
            state: ProviderConnectionState.Disconnected
        });
    }

    /**
     * Check health of a provider's connection pool
     */
    public async checkHealth(providerId: string): Promise<PoolHealth> {
        const pool = this.pools.get(providerId);
        if (!pool) {
            return {
                isHealthy: false,
                activeConnections: 0,
                errorRate: 1
            };
        }

        let totalErrors = 0;
        let lastError: Error | undefined;

        for (const connection of pool.connections.values()) {
            if (connection.errorCount > 0) {
                totalErrors += connection.errorCount;
                lastError = connection.lastError;
            }
        }

        const errorRate = totalErrors / (pool.connections.size || 1);
        const isHealthy = errorRate < 0.5 && pool.activeCount > 0;

        return {
            isHealthy,
            activeConnections: pool.activeCount,
            errorRate,
            lastError
        };
    }

    /**
     * Create pool configuration from provider config
     */
    private createPoolConfig(config: ProviderConfig): PoolConfig {
        return {
            ...this.defaultConfig,
            // Override defaults with provider config if provided
            maxConnections: config.maxConnections ?? this.defaultConfig.maxConnections,
            idleTimeoutMs: config.connectionTimeout ?? this.defaultConfig.idleTimeoutMs,
            healthCheckIntervalMs: config.healthCheckInterval ?? this.defaultConfig.healthCheckIntervalMs
        };
    }

    /**
     * Create a new connection
     */
    private createConnection(): PooledConnection {
        return {
            id: `conn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            state: ProviderConnectionState.Connected,
            lastUsed: Date.now(),
            errorCount: 0
        };
    }

    /**
     * Start health check interval for a provider
     */
    private startHealthChecks(providerId: string): void {
        const pool = this.pools.get(providerId);
        if (!pool) return;

        const interval = setInterval(async () => {
            const health = await this.checkHealth(providerId);
            
            if (!health.isHealthy) {
                this.emit('connectionStateChanged', {
                    providerId,
                    state: ProviderConnectionState.Error,
                    error: health.lastError
                });
            }
        }, pool.config.healthCheckIntervalMs);

        this.healthCheckIntervals.set(providerId, interval);
    }

    /**
     * Clean up all resources
     */
    public dispose(): void {
        // Clear all health check intervals
        for (const interval of this.healthCheckIntervals.values()) {
            clearInterval(interval);
        }
        this.healthCheckIntervals.clear();

        // Clear all pools
        this.pools.clear();

        // Remove all listeners
        this.removeAllListeners();
    }
}