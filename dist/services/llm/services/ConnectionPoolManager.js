"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ConnectionPoolManager = exports.ProviderEvent = exports.ProviderConnectionState = void 0;
const events_1 = require("events");
const errors_1 = require("../errors");
const ProviderFactory_1 = require("../providers/ProviderFactory");
// Define missing types that were previously imported
var ProviderConnectionState;
(function (ProviderConnectionState) {
    ProviderConnectionState["Disconnected"] = "disconnected";
    ProviderConnectionState["Connecting"] = "connecting";
    ProviderConnectionState["Connected"] = "connected";
    ProviderConnectionState["Error"] = "error";
})(ProviderConnectionState = exports.ProviderConnectionState || (exports.ProviderConnectionState = {}));
var ProviderEvent;
(function (ProviderEvent) {
    ProviderEvent["Connected"] = "provider:connected";
    ProviderEvent["Disconnected"] = "provider:disconnected";
    ProviderEvent["Error"] = "provider:error";
    ProviderEvent["HealthCheckComplete"] = "provider:healthcheck";
})(ProviderEvent = exports.ProviderEvent || (exports.ProviderEvent = {}));
class ConnectionPoolManager extends events_1.EventEmitter {
    constructor() {
        super();
        this.pools = new Map();
        this.poolConfigs = new Map();
        this.startMaintenanceTimer();
    }
    startMaintenanceTimer() {
        this.maintenanceTimer = setInterval(() => {
            this.performPoolMaintenance();
        }, 60000); // Run maintenance every minute
    }
    async performPoolMaintenance() {
        const now = Date.now();
        for (const [providerId, pool] of this.pools) {
            const config = this.poolConfigs.get(providerId);
            if (!config) {
                continue;
            }
            // Check idle connections
            for (const [connectionId, connection] of pool) {
                if (!connection.isInUse &&
                    now - connection.lastUsed > config.idleTimeoutMs) {
                    // Remove idle connection
                    await this.removeConnection(providerId, connectionId);
                }
            }
            // Ensure minimum pool size
            const activeConnections = Array.from(pool.values())
                .filter(conn => !conn.isInUse).length;
            if (activeConnections < config.minSize) {
                try {
                    await this.addConnection(providerId);
                }
                catch (error) {
                    console.error(`Failed to maintain minimum pool size for provider ${providerId}:`, error);
                }
            }
        }
    }
    async initializeProvider(providerId, config) {
        if (!this.pools.has(providerId)) {
            this.pools.set(providerId, new Map());
        }
        this.poolConfigs.set(providerId, {
            minSize: config.connection?.poolSize || 1,
            maxSize: config.connection?.poolSize || 5,
            idleTimeoutMs: 300000,
            acquireTimeoutMs: config.connection?.timeout || 30000
        });
        // Initialize minimum connections
        const poolConfig = this.poolConfigs.get(providerId);
        for (let i = 0; i < poolConfig.minSize; i++) {
            await this.addConnection(providerId);
        }
    }
    async addConnection(providerId) {
        const pool = this.pools.get(providerId);
        const config = this.poolConfigs.get(providerId);
        if (!pool || !config) {
            throw new errors_1.ConnectionError('Provider not initialized', providerId, 'NOT_INITIALIZED');
        }
        if (pool.size >= config.maxSize) {
            throw new errors_1.ConnectionError('Connection pool is full', providerId, 'POOL_FULL');
        }
        // Create new connection ID
        const connectionId = `${providerId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        try {
            // Get provider instance from factory/registry
            const provider = await this.createProviderInstance(providerId);
            // Initialize connection
            await provider.connect();
            // Add to pool
            pool.set(connectionId, {
                provider,
                lastUsed: Date.now(),
                isInUse: false,
                healthStatus: await provider.healthCheck()
            });
            return connectionId;
        }
        catch (error) {
            throw new errors_1.ConnectionError('Failed to create connection', providerId, 'CONNECTION_FAILED', error instanceof Error ? error : undefined);
        }
    }
    async removeConnection(providerId, connectionId) {
        const pool = this.pools.get(providerId);
        if (!pool) {
            return;
        }
        const connection = pool.get(connectionId);
        if (!connection) {
            return;
        }
        try {
            await connection.provider.dispose();
        }
        finally {
            pool.delete(connectionId);
        }
    }
    async acquireConnection(providerId) {
        const pool = this.pools.get(providerId);
        const config = this.poolConfigs.get(providerId);
        if (!pool || !config) {
            throw new errors_1.ConnectionError('Provider not initialized', providerId, 'NOT_INITIALIZED');
        }
        // First, try to find an available healthy connection
        for (const [connectionId, connection] of pool) {
            if (!connection.isInUse && connection.healthStatus.isHealthy) {
                connection.isInUse = true;
                connection.lastUsed = Date.now();
                return connection.provider;
            }
        }
        // If no available connections and below maxSize, create new one
        if (pool.size < config.maxSize) {
            const connectionId = await this.addConnection(providerId);
            const connection = pool.get(connectionId);
            connection.isInUse = true;
            return connection.provider;
        }
        // Wait for a connection to become available
        return new Promise((resolve, reject) => {
            const timeout = setTimeout(() => {
                reject(new errors_1.ConnectionError('Timeout waiting for available connection', providerId, 'ACQUIRE_TIMEOUT'));
            }, config.acquireTimeoutMs);
            const checkForConnection = () => {
                for (const [connectionId, connection] of pool) {
                    if (!connection.isInUse && connection.healthStatus.isHealthy) {
                        clearTimeout(timeout);
                        connection.isInUse = true;
                        connection.lastUsed = Date.now();
                        resolve(connection.provider);
                        return;
                    }
                }
                setTimeout(checkForConnection, 100);
            };
            checkForConnection();
        });
    }
    async releaseConnection(providerId, provider) {
        const pool = this.pools.get(providerId);
        if (!pool) {
            return;
        }
        for (const [connectionId, connection] of pool) {
            if (connection.provider === provider) {
                connection.isInUse = false;
                connection.lastUsed = Date.now();
                // Perform health check
                try {
                    connection.healthStatus = await provider.healthCheck();
                    if (!connection.healthStatus.isHealthy) {
                        await this.removeConnection(providerId, connectionId);
                    }
                }
                catch (error) {
                    await this.removeConnection(providerId, connectionId);
                }
                break;
            }
        }
    }
    async createProviderInstance(providerId) {
        // Use ProviderFactory to create provider instances
        const factory = ProviderFactory_1.ProviderFactory.getInstance();
        // Since we don't have direct access to the config here,
        // we need to use a default/minimal config.
        // In a real implementation, this should come from a config service or cache
        const defaultConfig = {
            apiEndpoint: 'http://localhost:11434',
            id: providerId,
            name: providerId,
            defaultModel: 'llama2'
        };
        // Determine the provider type
        let providerType = 'ollama';
        if (providerId.includes('llamaapi')) {
            providerType = 'llamaapi';
        }
        else if (providerId.includes('lmstudio')) {
            providerType = 'lmstudio';
        }
        return await factory.createProvider(providerType, defaultConfig);
    }
    dispose() {
        if (this.maintenanceTimer) {
            clearInterval(this.maintenanceTimer);
        }
        // Clean up all connections
        for (const [providerId, pool] of this.pools) {
            for (const [connectionId] of pool) {
                this.removeConnection(providerId, connectionId).catch(console.error);
            }
        }
        this.pools.clear();
        this.poolConfigs.clear();
        this.removeAllListeners();
    }
}
exports.ConnectionPoolManager = ConnectionPoolManager;
//# sourceMappingURL=ConnectionPoolManager.js.map