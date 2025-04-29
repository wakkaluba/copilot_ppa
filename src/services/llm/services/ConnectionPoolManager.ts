import { LLMProvider } from '../llmProvider';
import { ProviderConfig } from '../validators/ProviderConfigValidator';
import { ProviderError } from '../errors';
import { EventEmitter } from 'events';

interface PoolConnection {
    provider: LLMProvider;
    inUse: boolean;
    lastUsed: number;
}

export class ConnectionPoolManager extends EventEmitter {
    private pools = new Map<string, PoolConnection[]>();
    private maxPoolSize = 5;
    private idleTimeout = 5 * 60 * 1000; // 5 minutes

    constructor() {
        super();
        this.startIdleCleanup();
    }

    public async initializeProvider(providerId: string, config: ProviderConfig): Promise<void> {
        if (!this.pools.has(providerId)) {
            this.pools.set(providerId, []);
        }
    }

    public async acquireConnection(providerId: string): Promise<LLMProvider> {
        const pool = this.pools.get(providerId);
        if (!pool) {
            throw new ProviderError('Provider not initialized', providerId);
        }

        // Try to find an available connection
        const availableConnection = pool.find(conn => !conn.inUse);
        if (availableConnection) {
            availableConnection.inUse = true;
            availableConnection.lastUsed = Date.now();
            return availableConnection.provider;
        }

        // Check if we can create a new connection
        if (pool.length < this.maxPoolSize) {
            const provider = pool[0]?.provider;
            if (!provider) {
                throw new ProviderError('No provider template available', providerId);
            }

            const newProvider = { ...provider }; // Clone the provider
            const connection: PoolConnection = {
                provider: newProvider,
                inUse: true,
                lastUsed: Date.now()
            };
            pool.push(connection);
            return newProvider;
        }

        throw new ProviderError('Connection pool exhausted', providerId);
    }

    public async releaseConnection(providerId: string, provider: LLMProvider): Promise<void> {
        const pool = this.pools.get(providerId);
        if (!pool) return;

        const connection = pool.find(conn => conn.provider === provider);
        if (connection) {
            connection.inUse = false;
            connection.lastUsed = Date.now();
        }
    }

    private startIdleCleanup(): void {
        setInterval(() => {
            const now = Date.now();
            for (const [providerId, pool] of this.pools) {
                const activeConnections = pool.filter(conn => {
                    const isIdle = !conn.inUse && (now - conn.lastUsed) > this.idleTimeout;
                    if (isIdle) {
                        conn.provider.dispose?.();
                    }
                    return !isIdle;
                });
                if (activeConnections.length !== pool.length) {
                    this.pools.set(providerId, activeConnections);
                }
            }
        }, this.idleTimeout);
    }

    public async dispose(): Promise<void> {
        for (const pool of this.pools.values()) {
            for (const conn of pool) {
                await conn.provider.disconnect().catch(() => {});
                conn.provider.dispose?.();
            }
        }
        this.pools.clear();
        this.removeAllListeners();
    }
}