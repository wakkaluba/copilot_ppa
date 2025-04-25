import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { EventEmitter } from 'events';

export interface ModelHealth {
    status: 'healthy' | 'degraded' | 'failing';
    uptime: number;
    metrics: {
        errorRate: number;
        latency: number;
        degradedPeriods: number;
    };
    lastCheck: number;
    details?: Record<string, any>;
}

/**
 * Service for monitoring model health
 */
@injectable()
export class ModelHealthMonitorV2 extends EventEmitter {
    private health = new Map<string, ModelHealth>();
    private monitoringInterval: NodeJS.Timer | null = null;
    private startTimes = new Map<string, number>();
    
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject('HealthMonitorConfig') private readonly config: any = {}
    ) {
        super();
        this.logger.info('ModelHealthMonitorV2 initialized');
        this.startMonitoring();
    }
    
    /**
     * Start health monitoring at regular intervals
     */
    private startMonitoring(): void {
        const frequency = this.config.monitoringFrequency || 30000; // Default to 30 seconds
        
        if (this.monitoringInterval) {
            return;
        }
        
        this.monitoringInterval = setInterval(async () => {
            try {
                await this.checkHealth();
            } catch (error) {
                this.logger.error('Error checking health', error);
            }
        }, frequency);
        
        this.logger.info(`Started health monitoring with frequency ${frequency}ms`);
    }
    
    /**
     * Check health of all registered models
     */
    private async checkHealth(): Promise<void> {
        try {
            const modelIds = Array.from(this.health.keys());
            
            for (const modelId of modelIds) {
                const currentHealth = this.health.get(modelId)!;
                const newHealth = await this.simulateHealthCheck(modelId, currentHealth);
                
                // Check if status changed
                const statusChanged = currentHealth.status !== newHealth.status;
                
                // Update health
                this.health.set(modelId, newHealth);
                
                if (statusChanged) {
                    this.emit('healthStatusChanged', {
                        modelId,
                        previousStatus: currentHealth.status,
                        currentStatus: newHealth.status,
                        health: newHealth
                    });
                }
                
                this.emit('healthChecked', {
                    modelId,
                    health: newHealth
                });
            }
            
            this.logger.debug(`Checked health for ${modelIds.length} models`);
        } catch (error) {
            this.logger.error('Error in health check cycle', error);
        }
    }
    
    /**
     * Simulate a health check (for testing)
     */
    private async simulateHealthCheck(modelId: string, currentHealth: ModelHealth): Promise<ModelHealth> {
        // Calculate uptime
        const startTime = this.startTimes.get(modelId) || Date.now();
        const uptime = Date.now() - startTime;
        
        // Default to healthy with small random fluctuations
        const errorRate = Math.max(0, currentHealth.metrics.errorRate + (Math.random() * 0.01) - 0.005);
        const latency = Math.max(10, currentHealth.metrics.latency + (Math.random() * 20) - 10);
        
        // Determine status based on metrics
        let status: 'healthy' | 'degraded' | 'failing';
        let degradedPeriods = currentHealth.metrics.degradedPeriods;
        
        if (errorRate > 0.1 || latency > 500) {
            status = 'failing';
            degradedPeriods++;
        } else if (errorRate > 0.02 || latency > 300) {
            status = 'degraded';
            degradedPeriods++;
        } else {
            status = 'healthy';
        }
        
        return {
            status,
            uptime,
            metrics: {
                errorRate,
                latency,
                degradedPeriods
            },
            lastCheck: Date.now(),
        };
    }
    
    /**
     * Register a model for health monitoring
     */
    public registerModel(modelId: string): void {
        if (!this.health.has(modelId)) {
            const now = Date.now();
            this.startTimes.set(modelId, now);
            
            const initialHealth: ModelHealth = {
                status: 'healthy',
                uptime: 0,
                metrics: {
                    errorRate: 0.005,
                    latency: 150,
                    degradedPeriods: 0
                },
                lastCheck: now
            };
            
            this.health.set(modelId, initialHealth);
            this.emit('modelRegistered', { modelId, health: initialHealth });
            this.logger.info(`Registered model for health monitoring: ${modelId}`);
        }
    }
    
    /**
     * Get health status for a model
     */
    public getHealth(modelId: string): ModelHealth | undefined {
        const health = this.health.get(modelId);
        
        if (!health) {
            // Auto-register if not found
            this.registerModel(modelId);
            return this.health.get(modelId);
        }
        
        return health;
    }
    
    /**
     * Update health metrics manually
     */
    public updateHealth(modelId: string, metrics: Partial<ModelHealth>): void {
        const currentHealth = this.getHealth(modelId) || this.createDefaultHealth(modelId);
        
        const updatedHealth: ModelHealth = {
            ...currentHealth,
            ...metrics,
            metrics: {
                ...currentHealth.metrics,
                ...(metrics.metrics || {})
            },
            lastCheck: Date.now()
        };
        
        const statusChanged = currentHealth.status !== updatedHealth.status;
        
        this.health.set(modelId, updatedHealth);
        
        if (statusChanged) {
            this.emit('healthStatusChanged', {
                modelId,
                previousStatus: currentHealth.status,
                currentStatus: updatedHealth.status,
                health: updatedHealth
            });
        }
        
        this.emit('healthUpdated', {
            modelId,
            health: updatedHealth
        });
        
        this.logger.debug(`Updated health for model ${modelId}`, updatedHealth);
    }
    
    private createDefaultHealth(modelId: string): ModelHealth {
        const now = Date.now();
        this.startTimes.set(modelId, now);
        
        return {
            status: 'healthy',
            uptime: 0,
            metrics: {
                errorRate: 0.005,
                latency: 150,
                degradedPeriods: 0
            },
            lastCheck: now
        };
    }
    
    /**
     * Dispose of resources
     */
    public dispose(): void {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        
        this.removeAllListeners();
        this.health.clear();
        this.startTimes.clear();
        this.logger.info('ModelHealthMonitorV2 disposed');
    }
}
