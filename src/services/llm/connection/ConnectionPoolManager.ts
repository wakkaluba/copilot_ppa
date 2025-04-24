import { EventEmitter } from 'events';
import { LLMProvider, ProviderConfig, ProviderConnectionState } from '../types';

export class ConnectionPoolManager extends EventEmitter {
    private pools = new Map<string, ProviderConnectionPool>();
    private healthChecks = new Map<string, NodeJS.Timeout>();
    
    async initializeProvider(providerId: string, config: ProviderConfig): Promise<void> {
        const pool = new ProviderConnectionPool(config.poolSize || 1);
        this.pools.set(providerId, pool);
        
        // Start health monitoring
        this.startHealthCheck(providerId);
    }
    
    private startHealthCheck(providerId: string) {
        const interval = setInterval(async () => {
            const pool = this.pools.get(providerId);
            if (!pool) {return;}
            
            const health = await pool.checkHealth();
            this.emit('healthCheck', {
                providerId,
                health,
                timestamp: Date.now()
            });
        }, 30000); // Check every 30 seconds
        
        this.healthChecks.set(providerId, interval);
    }
    
    async acquireConnection(providerId: string): Promise<LLMProvider> {
        const pool = this.pools.get(providerId);
        if (!pool) {
            throw new Error(`No connection pool for provider ${providerId}`);
        }
        
        const connection = await pool.acquire();
        this.emit('connectionStateChanged', {
            providerId,
            state: ProviderConnectionState.Active,
            timestamp: Date.now()
        });
        
        return connection;
    }
    
    async releaseConnection(providerId: string, connection: LLMProvider): Promise<void> {
        const pool = this.pools.get(providerId);
        if (!pool) {return;}
        
        await pool.release(connection);
        this.emit('connectionStateChanged', {
            providerId,
            state: ProviderConnectionState.Available,
            timestamp: Date.now()
        });
    }
    
    async disposeProvider(providerId: string): Promise<void> {
        const pool = this.pools.get(providerId);
        if (!pool) {return;}
        
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
    
    dispose(): void {
        // Clean up all providers
        for (const [providerId] of this.pools) {
            this.disposeProvider(providerId).catch(console.error);
        }
        this.removeAllListeners();
    }
}