import { EventEmitter } from 'events';
import { ConnectionMetricsTracker } from './ConnectionMetricsTracker';
import { ConnectionRetryHandler } from './ConnectionRetryHandler';
import { HealthCheckConfig, HealthCheckResponse, ProviderHealth, ProviderStatus } from './types';
import { BaseConnectionManager } from './BaseConnectionManager';

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
    private readonly connectionManagers: Map<string, BaseConnectionManager> = new Map();
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

    public registerConnectionManager(providerId: string, manager: BaseConnectionManager): void {
        this.connectionManagers.set(providerId, manager);
        this.initializeHealth(providerId);
    }

    private initializeHealth(providerId: string): void {
        if (!this.healthStates.has(providerId)) {
            this.healthStates.set(providerId, {
                status: ProviderStatus.UNKNOWN,
                lastCheck: 0,
                lastSuccess: 0,
                consecutiveSuccesses: 0,
                consecutiveFailures: 0,
                totalChecks: 0,
                error: undefined
            });
        }
    }

    public startMonitoring(
        providerId: string,
        healthCheck: () => Promise<HealthCheckResponse>,
        config: HealthCheckConfig
    ): void {
        this.initializeHealthState(providerId);
        this.stopMonitoring(providerId);

        const interval = setInterval(async () => {
            await this.performHealthCheck(providerId, healthCheck, config);
        }, config.checkIntervalMs);

        this.checkIntervals.set(providerId, interval);
        // Perform initial health check
        this.performHealthCheck(providerId, healthCheck, config);
    }

    private async performHealthCheck(
        providerId: string,
        healthCheck: () => Promise<HealthCheckResponse>,
        config: HealthCheckConfig
    ): Promise<void> {
        const state = this.healthStates.get(providerId)!;
        const timeoutPromise = new Promise<HealthCheckResponse>((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), config.timeoutMs);
        });

        try {
            const response = await Promise.race([healthCheck(), timeoutPromise]);
            this.handleSuccessfulCheck(providerId, state, config);
            this.emit('healthCheckSuccess', { providerId, response });
        } catch (error) {
            this.handleFailedCheck(providerId, state, config, error as Error);
            this.emit('healthCheckFailure', { providerId, error });
        }

        state.totalChecks++;
        this.emit('healthStateChanged', { providerId, state: { ...state } });
    }

    private handleSuccessfulCheck(
        providerId: string,
        state: ProviderHealth,
        config: HealthCheckConfig
    ): void {
        state.lastSuccess = Date.now();
        state.consecutiveFailures = 0;
        state.consecutiveSuccesses++;
        state.error = undefined;

        if (state.consecutiveSuccesses >= config.healthyThreshold) {
            state.status = ProviderStatus.HEALTHY;
        }
    }

    private handleFailedCheck(
        providerId: string,
        state: ProviderHealth,
        config: HealthCheckConfig,
        error: Error
    ): void {
        state.consecutiveFailures++;
        state.consecutiveSuccesses = 0;
        state.error = error;

        if (state.consecutiveFailures >= config.unhealthyThreshold) {
            state.status = ProviderStatus.UNHEALTHY;
        }
    }

    private initializeHealthState(providerId: string): void {
        if (!this.healthStates.has(providerId)) {
            this.healthStates.set(providerId, {
                status: ProviderStatus.UNKNOWN,
                lastCheck: 0,
                lastSuccess: 0,
                consecutiveFailures: 0,
                consecutiveSuccesses: 0,
                totalChecks: 0
            });
        }
    }

    public stopMonitoring(providerId: string): void {
        const interval = this.checkIntervals.get(providerId);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(providerId);
        }
    }

    public getProviderHealth(providerId: string): ProviderHealth | undefined {
        return this.healthStates.get(providerId);
    }

    public isHealthy(providerId: string): boolean {
        const health = this.healthStates.get(providerId);
        return health?.status === ProviderStatus.HEALTHY;
    }

    public dispose(): void {
        for (const interval of this.checkIntervals.values()) {
            clearInterval(interval);
        }
        this.checkIntervals.clear();
        this.healthStates.clear();
        this.connectionManagers.clear();
        this.removeAllListeners();
    }
}