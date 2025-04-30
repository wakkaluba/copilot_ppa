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
export declare class ModelHealthMonitorV2 extends EventEmitter {
    private readonly logger;
    private readonly config;
    private health;
    private monitoringInterval;
    private startTimes;
    constructor(logger: ILogger, config?: any);
    /**
     * Start health monitoring at regular intervals
     */
    private startMonitoring;
    /**
     * Check health of all registered models
     */
    private checkHealth;
    /**
     * Simulate a health check (for testing)
     */
    private simulateHealthCheck;
    /**
     * Register a model for health monitoring
     */
    registerModel(modelId: string): void;
    /**
     * Get health status for a model
     */
    getHealth(modelId: string): ModelHealth | undefined;
    /**
     * Update health metrics manually
     */
    updateHealth(modelId: string, metrics: Partial<ModelHealth>): void;
    private createDefaultHealth;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
