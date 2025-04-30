"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPoolManager = void 0;
const errors_1 = require("../errors");
const events_1 = require("events");
class ConnectionPoolManager extends events_1.EventEmitter {
    pools = new Map();
    maxPoolSize = 5;
    idleTimeout = 5 * 60 * 1000; // 5 minutes
    constructor() {
        super();
        this.startIdleCleanup();
    }
    async initializeProvider(providerId, config) {
        if (!this.pools.has(providerId)) {
            this.pools.set(providerId, []);
        }
    }
    async acquireConnection(providerId) {
        const pool = this.pools.get(providerId);
        if (!pool) {
            throw new errors_1.ProviderError('Provider not initialized', providerId);
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
                throw new errors_1.ProviderError('No provider template available', providerId);
            }
            const newProvider = { ...provider }; // Clone the provider
            const connection = {
                provider: newProvider,
                inUse: true,
                lastUsed: Date.now()
            };
            pool.push(connection);
            return newProvider;
        }
        throw new errors_1.ProviderError('Connection pool exhausted', providerId);
    }
    async releaseConnection(providerId, provider) {
        const pool = this.pools.get(providerId);
        if (!pool)
            return;
        const connection = pool.find(conn => conn.provider === provider);
        if (connection) {
            connection.inUse = false;
            connection.lastUsed = Date.now();
        }
    }
    startIdleCleanup() {
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
    async dispose() {
        for (const pool of this.pools.values()) {
            for (const conn of pool) {
                await conn.provider.disconnect().catch(() => { });
                conn.provider.dispose?.();
            }
        }
        this.pools.clear();
        this.removeAllListeners();
    }
}
exports.ConnectionPoolManager = ConnectionPoolManager;
//# sourceMappingURL=ConnectionPoolManager.js.map