import { LLMProvider } from '../types';
import { HealthCheckResult } from '../interfaces';

interface PooledConnection {
    provider: LLMProvider;
    lastUsed: number;
    isActive: boolean;
}

export class ProviderConnectionPool {
    private connections: PooledConnection[] = [];
    private maxSize: number;
    
    constructor(maxSize: number) {
        this.maxSize = maxSize;
    }
    
    async acquire(): Promise<LLMProvider> {
        // Try to find an available connection
        const available = this.connections.find(c => !c.isActive);
        if (available) {
            available.isActive = true;
            available.lastUsed = Date.now();
            return available.provider;
        }
        
        // Create new connection if pool isn't full
        if (this.connections.length < this.maxSize) {
            const provider = await this.createConnection();
            this.connections.push({
                provider,
                lastUsed: Date.now(),
                isActive: true
            });
            return provider;
        }
        
        // Wait for a connection to become available
        return new Promise((resolve) => {
            const checkInterval = setInterval(() => {
                const conn = this.connections.find(c => !c.isActive);
                if (conn) {
                    clearInterval(checkInterval);
                    conn.isActive = true;
                    conn.lastUsed = Date.now();
                    resolve(conn.provider);
                }
            }, 100);
        });
    }
    
    async release(provider: LLMProvider): Promise<void> {
        const connection = this.connections.find(c => c.provider === provider);
        if (connection) {
            connection.isActive = false;
            connection.lastUsed = Date.now();
        }
    }
    
    async checkHealth(): Promise<HealthCheckResult> {
        const results = await Promise.all(
            this.connections.map(async conn => {
                try {
                    const start = Date.now();
                    await conn.provider.healthCheck();
                    return {
                        isHealthy: true,
                        latency: Date.now() - start,
                        timestamp: new Date()
                    };
                } catch (error) {
                    return {
                        isHealthy: false,
                        latency: -1,
                        timestamp: new Date(),
                        error: error instanceof Error ? error : new Error(String(error))
                    };
                }
            })
        );
        
        // Aggregate health results
        const healthy = results.filter(r => r.isHealthy);
        return {
            isHealthy: healthy.length > 0,
            latency: healthy.reduce((sum, r) => sum + r.latency, 0) / healthy.length,
            timestamp: new Date(),
            details: {
                totalConnections: this.connections.length,
                healthyConnections: healthy.length,
                results
            }
        };
    }
    
    private async createConnection(): Promise<LLMProvider> {
        // This should be implemented by the specific provider implementation
        throw new Error('createConnection must be implemented by provider');
    }
    
    async dispose(): Promise<void> {
        await Promise.all(
            this.connections.map(async conn => {
                try {
                    await conn.provider.disconnect();
                } catch (error) {
                    console.error('Error disconnecting provider:', error);
                }
            })
        );
        this.connections = [];
    }
}