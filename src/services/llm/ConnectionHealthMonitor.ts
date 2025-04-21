import { EventEmitter } from 'events';
import { HealthCheckResponse, ProviderStatus } from './interfaces';
import { LLMConnectionError } from './errors';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';
import { ConnectionRetryHandler } from './ConnectionRetryHandler';

/**
 * Health check configuration
 */
interface HealthCheckConfig {
    checkIntervalMs: number;
    timeoutMs: number;
    unhealthyThreshold: number;
    healthyThreshold: number;
    maxConsecutiveFailures: number;
}

/**
 * Health state for a provider
 */
interface ProviderHealth {
    status: ProviderStatus;
    lastCheck: number;
    lastSuccess: number;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    totalChecks: number;
    error?: Error;
}

/**
 * Default health check configuration
 */
const DEFAULT_HEALTH_CONFIG: HealthCheckConfig = {
    checkIntervalMs: 30000, // 30 seconds
    timeoutMs: 5000,
    unhealthyThreshold: 3,
    healthyThreshold: 2,
    maxConsecutiveFailures: 5
};

/**
 * Monitors health of LLM connections
 */
export class ConnectionHealthMonitor extends EventEmitter {
    private static instance: ConnectionHealthMonitor;
    private readonly healthStates: Map<string, ProviderHealth> = new Map();
    private readonly checkIntervals: Map<string, NodeJS.Timeout> = new Map();
    private readonly configs: Map<string, HealthCheckConfig> = new Map();
    private readonly metricsTracker: ConnectionMetricsTracker;
    private readonly retryHandler: ConnectionRetryHandler;

    private constructor() {
        super();
        this.metricsTracker = new ConnectionMetricsTracker();
        this.retryHandler = ConnectionRetryHandler.getInstance();
    }

    public static getInstance(): ConnectionHealthMonitor {
        if (!this.instance) {
            this.instance = new ConnectionHealthMonitor();
        }
        return this.instance;
    }

    /**
     * Configure health monitoring for a provider
     */
    public configureProvider(
        providerId: string,
        config: Partial<HealthCheckConfig>,
        healthCheck: () => Promise<HealthCheckResponse>
    ): void {
        const fullConfig = {
            ...DEFAULT_HEALTH_CONFIG,
            ...config
        };
        
        this.configs.set(providerId, fullConfig);
        this.initializeHealth(providerId);
        this.startMonitoring(providerId, healthCheck);
    }

    /**
     * Get current health status for a provider
     */
    public getProviderHealth(providerId: string): ProviderHealth | undefined {
        return this.healthStates.get(providerId);
    }

    /**
     * Check if a provider is healthy
     */
    public isHealthy(providerId: string): boolean {
        const health = this.healthStates.get(providerId);
        return health?.status === ProviderStatus.HEALTHY;
    }

    /**
     * Manually trigger a health check
     */
    public async checkHealth(
        providerId: string,
        healthCheck: () => Promise<HealthCheckResponse>
    ): Promise<HealthCheckResponse> {
        const startTime = Date.now();
        
        try {
            const response = await this.retryHandler.checkHealthWithRetry(
                providerId,
                healthCheck
            );
            
            this.updateHealth(providerId, true);
            this.metricsTracker.recordRequest(Date.now() - startTime);
            
            return response;
        } catch (error) {
            this.updateHealth(providerId, false, error instanceof Error ? error : new Error(String(error)));
            this.metricsTracker.recordRequestFailure(error instanceof Error ? error : new Error(String(error)));
            throw error;
        }
    }

    private initializeHealth(providerId: string): void {
        this.healthStates.set(providerId, {
            status: ProviderStatus.UNKNOWN,
            lastCheck: 0,
            lastSuccess: 0,
            consecutiveFailures: 0,
            consecutiveSuccesses: 0,
            totalChecks: 0
        });
    }

    private startMonitoring(
        providerId: string,
        healthCheck: () => Promise<HealthCheckResponse>
    ): void {
        // Clear any existing interval
        this.stopMonitoring(providerId);

        const config = this.configs.get(providerId) || DEFAULT_HEALTH_CONFIG;
        const interval = setInterval(async () => {
            try {
                await this.checkHealth(providerId, healthCheck);
            } catch (error) {
                // Error is handled in checkHealth
            }
        }, config.checkIntervalMs);

        this.checkIntervals.set(providerId, interval);
    }

    private stopMonitoring(providerId: string): void {
        const interval = this.checkIntervals.get(providerId);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(providerId);
        }
    }

    private updateHealth(providerId: string, success: boolean, error?: Error): void {
        const health = this.healthStates.get(providerId);
        const config = this.configs.get(providerId) || DEFAULT_HEALTH_CONFIG;
        
        if (!health) return;

        const now = Date.now();
        health.lastCheck = now;
        health.totalChecks++;

        if (success) {
            health.lastSuccess = now;
            health.consecutiveSuccesses++;
            health.consecutiveFailures = 0;
            health.error = undefined;

            if (health.consecutiveSuccesses >= config.healthyThreshold) {
                health.status = ProviderStatus.HEALTHY;
            }
        } else {
            health.consecutiveFailures++;
            health.consecutiveSuccesses = 0;
            health.error = error;

            if (health.consecutiveFailures >= config.unhealthyThreshold) {
                health.status = ProviderStatus.UNHEALTHY;
            }

            if (health.consecutiveFailures >= config.maxConsecutiveFailures) {
                health.status = ProviderStatus.FAILED;
                this.emit('providerFailed', {
                    providerId,
                    error,
                    health: { ...health }
                });
            }
        }

        this.emit('healthUpdated', {
            providerId,
            health: { ...health }
        });
    }

    /**
     * Clear monitoring for a provider
     */
    public clearProvider(providerId: string): void {
        this.stopMonitoring(providerId);
        this.healthStates.delete(providerId);
        this.configs.delete(providerId);
    }

    public dispose(): void {
        // Stop all monitoring
        for (const providerId of this.checkIntervals.keys()) {
            this.clearProvider(providerId);
        }
        
        this.metricsTracker.dispose();
        this.removeAllListeners();
    }
}