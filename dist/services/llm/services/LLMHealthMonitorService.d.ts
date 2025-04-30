import { EventEmitter } from 'events';
import { LLMHealthStatus, LLMHealthCheckResult } from '../types';
import { LLMEventManagerService } from './LLMEventManagerService';
export declare class LLMHealthMonitorService extends EventEmitter {
    private eventManager;
    private healthCheckCallback?;
    private healthStatus;
    private checkIntervals;
    private readonly DEFAULT_CHECK_INTERVAL;
    constructor(eventManager: LLMEventManagerService, healthCheckCallback?: ((providerId: string) => Promise<LLMHealthCheckResult>) | undefined);
    private setupEventListeners;
    private handleStateChange;
    performHealthCheck(providerId: string): Promise<LLMHealthCheckResult>;
    private updateHealthStatus;
    startHealthChecks(providerId: string, interval?: number): void;
    stopHealthChecks(providerId: string): void;
    getHealthStatus(providerId: string): LLMHealthStatus | undefined;
    dispose(): void;
}
