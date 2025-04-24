import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { LLMModelInfo } from '../types';

interface HealthConfig {
    checkInterval: number;
    failureThreshold: number;
    recoveryThreshold: number;
    timeoutMs: number;
    retryDelayMs: number;
}

interface HealthMetrics {
    responseTime: number;
    errorRate: number;
    requestCount: number;
    lastCheck: number;
    status: 'healthy' | 'degraded' | 'unhealthy';
    failures: number;
    successes: number;
}

interface ModelHealth {
    modelId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: number;
    metrics: HealthMetrics;
    error?: Error;
}

@injectable()
export class ModelHealthMonitorV2 extends EventEmitter implements vscode.Disposable {
    private readonly healthStatus = new Map<string, ModelHealth>();
    private readonly checkIntervals = new Map<string, NodeJS.Timer>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        private readonly config: HealthConfig = {
            checkInterval: 30000, // 30 seconds
            failureThreshold: 3,
            recoveryThreshold: 2,
            timeoutMs: 5000,
            retryDelayMs: 1000
        }
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Health Monitor');
    }

    public async startMonitoring(model: LLMModelInfo): Promise<void> {
        try {
            if (this.checkIntervals.has(model.id)) {
                return;
            }

            this.initializeHealth(model.id);
            const timer = setInterval(() => this.performHealthCheck(model), this.config.checkInterval);
            this.checkIntervals.set(model.id, timer);

            // Perform initial health check
            await this.performHealthCheck(model);
            this.emit('monitoringStarted', { modelId: model.id });
        } catch (error) {
            this.handleError(`Failed to start monitoring model ${model.id}`, error as Error);
            throw error;
        }
    }

    public stopMonitoring(modelId: string): void {
        try {
            const timer = this.checkIntervals.get(modelId);
            if (timer) {
                clearInterval(timer);
                this.checkIntervals.delete(modelId);
                this.emit('monitoringStopped', { modelId });
            }
        } catch (error) {
            this.handleError(`Failed to stop monitoring model ${modelId}`, error as Error);
        }
    }

    private async performHealthCheck(model: LLMModelInfo): Promise<void> {
        const health = this.healthStatus.get(model.id);
        if (!health) {return;}

        try {
            const startTime = Date.now();
            await this.executeHealthCheck(model);
            const responseTime = Date.now() - startTime;

            this.updateHealthMetrics(model.id, {
                responseTime,
                success: true,
                error: undefined
            });
        } catch (error) {
            this.updateHealthMetrics(model.id, {
                responseTime: 0,
                success: false,
                error: error as Error
            });
        }
    }

    private async executeHealthCheck(model: LLMModelInfo): Promise<void> {
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => reject(new Error('Health check timeout')), this.config.timeoutMs);
        });

        try {
            await Promise.race([
                this.runModelTest(model),
                timeoutPromise
            ]);
        } catch (error) {
            throw error;
        }
    }

    private async runModelTest(model: LLMModelInfo): Promise<void> {
        // Basic test prompt to verify model responsiveness
        const testPrompt = 'Test prompt: Please respond with "OK" to verify health.';
        
        try {
            // TODO: Implement actual model invocation here
            // This is a placeholder for the actual implementation
            await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
            throw new Error(`Model test failed: ${error}`);
        }
    }

    private updateHealthMetrics(modelId: string, result: {
        responseTime: number;
        success: boolean;
        error?: Error;
    }): void {
        const health = this.healthStatus.get(modelId);
        if (!health) {return;}

        health.lastCheck = Date.now();
        health.metrics.lastCheck = Date.now();
        health.metrics.requestCount++;

        if (result.success) {
            health.metrics.successes++;
            health.metrics.failures = 0;
            health.metrics.responseTime = result.responseTime;
            
            if (health.metrics.successes >= this.config.recoveryThreshold) {
                health.status = 'healthy';
                health.error = undefined;
            }
        } else {
            health.metrics.failures++;
            health.metrics.successes = 0;
            health.error = result.error;
            
            if (health.metrics.failures >= this.config.failureThreshold) {
                health.status = 'unhealthy';
            } else {
                health.status = 'degraded';
            }
        }

        health.metrics.errorRate = health.metrics.failures / health.metrics.requestCount;

        this.emit('healthUpdate', { modelId, health: { ...health } });
        this.logHealthUpdate(modelId, health);
    }

    private initializeHealth(modelId: string): void {
        this.healthStatus.set(modelId, {
            modelId,
            status: 'healthy',
            lastCheck: Date.now(),
            metrics: {
                responseTime: 0,
                errorRate: 0,
                requestCount: 0,
                lastCheck: Date.now(),
                status: 'healthy',
                failures: 0,
                successes: 0
            }
        });
    }

    public getHealth(modelId: string): ModelHealth | undefined {
        return this.healthStatus.get(modelId);
    }

    public getHealthMetrics(modelId: string): HealthMetrics | undefined {
        return this.healthStatus.get(modelId)?.metrics;
    }

    public isHealthy(modelId: string): boolean {
        return this.healthStatus.get(modelId)?.status === 'healthy';
    }

    private logHealthUpdate(modelId: string, health: ModelHealth): void {
        this.outputChannel.appendLine('\nHealth Update:');
        this.outputChannel.appendLine(`Model: ${modelId}`);
        this.outputChannel.appendLine(`Status: ${health.status}`);
        this.outputChannel.appendLine(`Response Time: ${health.metrics.responseTime}ms`);
        this.outputChannel.appendLine(`Error Rate: ${(health.metrics.errorRate * 100).toFixed(1)}%`);
        this.outputChannel.appendLine(`Request Count: ${health.metrics.requestCount}`);
        
        if (health.error) {
            this.outputChannel.appendLine(`Last Error: ${health.error.message}`);
        }
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelHealthMonitor]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public dispose(): void {
        for (const timer of this.checkIntervals.values()) {
            clearInterval(timer);
        }
        this.checkIntervals.clear();
        this.healthStatus.clear();
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
