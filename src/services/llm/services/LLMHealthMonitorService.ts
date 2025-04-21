import { EventEmitter } from 'events';
import { LLMConnectionState, LLMHealthStatus, LLMHealthCheckResult } from '../types';
import { LLMEventManagerService } from './LLMEventManagerService';

export class LLMHealthMonitorService extends EventEmitter {
    private healthStatus: Map<string, LLMHealthStatus> = new Map();
    private checkIntervals: Map<string, NodeJS.Timeout> = new Map();
    private readonly DEFAULT_CHECK_INTERVAL = 60000; // 1 minute

    constructor(
        private eventManager: LLMEventManagerService,
        private healthCheckCallback?: (providerId: string) => Promise<LLMHealthCheckResult>
    ) {
        super();
        this.setupEventListeners();
    }

    private setupEventListeners(): void {
        this.eventManager.on('stateChange', ({ providerId, newState }) => {
            this.handleStateChange(providerId, newState);
        });
    }

    private handleStateChange(providerId: string, state: LLMConnectionState): void {
        if (state === 'connected') {
            this.startHealthChecks(providerId);
        } else if (state === 'disconnected') {
            this.stopHealthChecks(providerId);
        }
    }

    public async performHealthCheck(providerId: string): Promise<LLMHealthCheckResult> {
        try {
            if (this.healthCheckCallback) {
                const result = await this.healthCheckCallback(providerId);
                this.updateHealthStatus(providerId, result);
                return result;
            }
            
            // Default health check if no callback provided
            const status: LLMHealthStatus = {
                isHealthy: true,
                latency: 0,
                lastCheck: Date.now(),
                errorCount: 0
            };
            
            this.updateHealthStatus(providerId, { status });
            return { status };
        } catch (error) {
            const status: LLMHealthStatus = {
                isHealthy: false,
                latency: -1,
                lastCheck: Date.now(),
                errorCount: (this.healthStatus.get(providerId)?.errorCount || 0) + 1,
                lastError: error instanceof Error ? error.message : String(error)
            };
            
            this.updateHealthStatus(providerId, { status });
            return { status, error };
        }
    }

    private updateHealthStatus(providerId: string, result: LLMHealthCheckResult): void {
        this.healthStatus.set(providerId, result.status);
        this.emit('healthUpdate', { providerId, ...result });
    }

    public startHealthChecks(providerId: string, interval = this.DEFAULT_CHECK_INTERVAL): void {
        if (this.checkIntervals.has(providerId)) {
            return;
        }

        const timer = setInterval(() => {
            this.performHealthCheck(providerId);
        }, interval);

        this.checkIntervals.set(providerId, timer);
    }

    public stopHealthChecks(providerId: string): void {
        const timer = this.checkIntervals.get(providerId);
        if (timer) {
            clearInterval(timer);
            this.checkIntervals.delete(providerId);
        }
    }

    public getHealthStatus(providerId: string): LLMHealthStatus | undefined {
        return this.healthStatus.get(providerId);
    }

    public dispose(): void {
        this.removeAllListeners();
        for (const timer of this.checkIntervals.values()) {
            clearInterval(timer);
        }
        this.checkIntervals.clear();
        this.healthStatus.clear();
    }
}