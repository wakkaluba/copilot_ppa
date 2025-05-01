import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMProvider } from '../llm-provider';

export interface IConnectionConfig {
    providerId: string;
    timeout?: number;
    retryAttempts?: number;
    healthCheckInterval?: number;
}

export interface IConnectionState {
    providerId: string;
    isConnected: boolean;
    lastConnected?: number;
    lastError?: Error;
    healthStatus?: IHealthStatus;
}

export interface IHealthStatus {
    lastCheck: number;
    isHealthy: boolean;
    latency: number;
    details?: Record<string, unknown>;
}

export interface IConnectionStats {
    totalConnections: number;
    failedConnections: number;
    averageLatency: number;
    uptime: number;
}

@injectable()
export class LLMConnectionManager extends EventEmitter {
    private readonly connections = new Map<string, IConnectionState>();
    private readonly stats = new Map<string, IConnectionStats>();
    private readonly healthCheckIntervals = new Map<string, NodeJS.Timer>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async connect(provider: ILLMProvider, config: IConnectionConfig): Promise<void> {
        try {
            const state: IConnectionState = {
                providerId: provider.id,
                isConnected: false
            };

            this.connections.set(provider.id, state);

            await this.establishConnection(provider, config);

            if (config.healthCheckInterval) {
                this.startHealthChecks(provider.id, config.healthCheckInterval);
            }
        } catch (error) {
            this.handleError(`Failed to connect to provider ${provider.id}`, error as Error);
            throw error;
        }
    }

    private async establishConnection(
        provider: ILLMProvider,
        config: IConnectionConfig
    ): Promise<void> {
        const state = this.getConnectionState(provider.id);
        const startTime = Date.now();

        try {
            await provider.connect();

            const latency = Date.now() - startTime;
            state.isConnected = true;
            state.lastConnected = Date.now();
            state.lastError = undefined;

            this.updateConnectionStats(provider.id, true, latency);
            this.emit('connected', { providerId: provider.id, latency });
        } catch (error) {
            state.isConnected = false;
            state.lastError = error as Error;

            this.updateConnectionStats(provider.id, false);
            throw error;
        }
    }

    public async disconnect(providerId: string): Promise<void> {
        try {
            const state = this.getConnectionState(providerId);
            if (!state.isConnected) {
                return;
            }

            this.stopHealthChecks(providerId);
            state.isConnected = false;
            this.emit('disconnected', { providerId });
        } catch (error) {
            this.handleError(`Failed to disconnect provider ${providerId}`, error as Error);
            throw error;
        }
    }

    public getConnectionState(providerId: string): IConnectionState {
        const state = this.connections.get(providerId);
        if (!state) {
            throw new Error(`No connection state found for provider ${providerId}`);
        }
        return state;
    }

    public getConnectionStats(providerId: string): IConnectionStats {
        return this.stats.get(providerId) || {
            totalConnections: 0,
            failedConnections: 0,
            averageLatency: 0,
            uptime: 0
        };
    }

    private startHealthChecks(providerId: string, intervalMs: number): void {
        if (this.healthCheckIntervals.has(providerId)) {
            return;
        }

        const interval = setInterval(async () => {
            try {
                await this.performHealthCheck(providerId);
            } catch (error) {
                this.logger.error(`Health check failed for provider ${providerId}`, error);
            }
        }, intervalMs);

        this.healthCheckIntervals.set(providerId, interval);
    }

    private async performHealthCheck(providerId: string): Promise<void> {
        const state = this.getConnectionState(providerId);
        const startTime = Date.now();

        try {
            // This would integrate with actual provider health check
            const isHealthy = true;
            const latency = Date.now() - startTime;

            state.healthStatus = {
                lastCheck: Date.now(),
                isHealthy,
                latency
            };

            this.emit('healthCheckCompleted', {
                providerId,
                status: state.healthStatus
            });
        } catch (error) {
            state.healthStatus = {
                lastCheck: Date.now(),
                isHealthy: false,
                latency: Date.now() - startTime
            };

            this.emit('healthCheckFailed', {
                providerId,
                error
            });
        }
    }

    private stopHealthChecks(providerId: string): void {
        const interval = this.healthCheckIntervals.get(providerId);
        if (interval) {
            clearInterval(interval);
            this.healthCheckIntervals.delete(providerId);
        }
    }

    private updateConnectionStats(
        providerId: string,
        success: boolean,
        latency?: number
    ): void {
        const current = this.stats.get(providerId) || {
            totalConnections: 0,
            failedConnections: 0,
            averageLatency: 0,
            uptime: 0
        };

        const updated = {
            ...current,
            totalConnections: current.totalConnections + 1,
            failedConnections: current.failedConnections + (success ? 0 : 1)
        };

        if (success && latency) {
            updated.averageLatency = (
                (current.averageLatency * current.totalConnections + latency) /
                (current.totalConnections + 1)
            );
        }

        this.stats.set(providerId, updated);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMConnectionManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        // Stop all health checks
        for (const providerId of this.healthCheckIntervals.keys()) {
            this.stopHealthChecks(providerId);
        }

        this.connections.clear();
        this.stats.clear();
        this.removeAllListeners();
    }
}
