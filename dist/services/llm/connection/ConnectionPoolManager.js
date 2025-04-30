"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPoolManager = void 0;
const events_1 = require("events");
const types_1 = require("../types");
class ConnectionPoolManager extends events_1.EventEmitter {
    pools = new Map();
    healthChecks = new Map();
    async initializeProvider(providerId, config) {
        const pool = new ProviderConnectionPool(config.poolSize || 1);
        this.pools.set(providerId, pool);
        // Start health monitoring
        this.startHealthCheck(providerId);
    }
    startHealthCheck(providerId) {
        const interval = setInterval(async () => {
            const pool = this.pools.get(providerId);
            if (!pool) {
                return;
            }
            const health = await pool.checkHealth();
            this.emit('healthCheck', {
                providerId,
                health,
                timestamp: new Date()
            });
        }, 30000); // Check every 30 seconds
        this.healthChecks.set(providerId, interval);
    }
    async acquireConnection(providerId) {
        const pool = this.pools.get(providerId);
        if (!pool) {
            throw new Error(`No connection pool for provider ${providerId}`);
        }
        const connection = await pool.acquire();
        this.emit('connectionStateChanged', {
            providerId,
            state: types_1.ProviderConnectionState.Active,
            timestamp: new Date()
        });
        return connection;
    }
    async releaseConnection(providerId, connection) {
        const pool = this.pools.get(providerId);
        if (!pool) {
            return;
        }
        await pool.release(connection);
        this.emit('connectionStateChanged', {
            providerId,
            state: types_1.ProviderConnectionState.Available,
            timestamp: new Date()
        });
    }
    async disposeProvider(providerId) {
        const pool = this.pools.get(providerId);
        if (!pool) {
            return;
        }
        // Clear health check interval
        const healthCheck = this.healthChecks.get(providerId);
        if (healthCheck) {
            clearInterval(healthCheck);
            this.healthChecks.delete(providerId);
        }
        // Dispose pool
        await pool.dispose();
        this.pools.delete(providerId);
    }
    dispose() {
        // Clean up all providers
        for (const [providerId] of this.pools) {
            this.disposeProvider(providerId).catch(console.error);
        }
        this.removeAllListeners();
    }
}
exports.ConnectionPoolManager = ConnectionPoolManager;
//# sourceMappingURL=ConnectionPoolManager.js.map