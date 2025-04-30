import { EventEmitter } from 'events';
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
 * Monitors health of LLM connections
 */
export declare class ConnectionHealthMonitor extends EventEmitter {
    private static instance;
    private readonly healthStates;
    private readonly checkIntervals;
    private readonly connectionManagers;
    private readonly metricsTracker;
    private readonly retryHandler;
    private constructor();
    static getInstance(): ConnectionHealthMonitor;
    registerConnectionManager(providerId: string, manager: BaseConnectionManager): void;
    private initializeHealth;
    startMonitoring(providerId: string, healthCheck: () => Promise<HealthCheckResponse>, config: HealthCheckConfig): void;
    private performHealthCheck;
    private handleSuccessfulCheck;
    private handleFailedCheck;
    private initializeHealthState;
    stopMonitoring(providerId: string): void;
    getProviderHealth(providerId: string): ProviderHealth | undefined;
    isHealthy(providerId: string): boolean;
    dispose(): void;
}
export {};
