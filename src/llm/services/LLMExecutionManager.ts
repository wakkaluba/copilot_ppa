import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest, ILLMResponse } from '../types';
import { IModelResourceOptimizer } from './ModelResourceOptimizer';

export interface IExecutionContext {
    requestId: string;
    modelId: string;
    startTime: number;
    timeout?: number;
    abortController?: AbortController;
    resourceAllocation?: {
        memory: number;
        cpu: number;
        gpu?: number;
    };
}

export interface IExecutionStats {
    totalExecutions: number;
    failedExecutions: number;
    averageLatency: number;
    resourceUtilization: {
        memory: number;
        cpu: number;
        gpu?: number;
    };
}

export interface IExecutionOptions {
    timeout?: number;
    maxRetries?: number;
    priority?: 'low' | 'normal' | 'high';
    resourceLimits?: {
        maxMemory?: number;
        maxCpu?: number;
        maxGpu?: number;
    };
}

@injectable()
export class LLMExecutionManager extends EventEmitter {
    private readonly executions = new Map<string, IExecutionContext>();
    private readonly stats: IExecutionStats = {
        totalExecutions: 0,
        failedExecutions: 0,
        averageLatency: 0,
        resourceUtilization: {
            memory: 0,
            cpu: 0
        }
    };

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(IModelResourceOptimizer) private readonly resourceOptimizer: IModelResourceOptimizer
    ) {
        super();
    }

    public async execute(
        request: ILLMRequest,
        options: IExecutionOptions = {}
    ): Promise<ILLMResponse> {
        try {
            const context = await this.createExecutionContext(request, options);
            this.executions.set(request.id, context);

            const startTime = Date.now();
            this.emit('executionStarted', { requestId: request.id, context });

            try {
                const response = await this.executeRequest(context);
                this.updateStats(true, Date.now() - startTime);
                return response;
            } catch (error) {
                this.updateStats(false, Date.now() - startTime);
                throw error;
            } finally {
                this.cleanupExecution(request.id);
            }
        } catch (error) {
            this.handleError(`Failed to execute request ${request.id}`, error as Error);
            throw error;
        }
    }

    private async createExecutionContext(
        request: ILLMRequest,
        options: IExecutionOptions
    ): Promise<IExecutionContext> {
        const abortController = new AbortController();
        const startTime = Date.now();

        // Check resource availability
        const resourceAllocation = await this.resourceOptimizer.allocateResources(request);

        return {
            requestId: request.id,
            modelId: request.model,
            startTime,
            timeout: options.timeout,
            abortController,
            resourceAllocation
        };
    }

    private async executeRequest(context: IExecutionContext): Promise<ILLMResponse> {
        // This would integrate with actual execution logic
        throw new Error('Method not implemented');
    }

    public async cancelExecution(requestId: string): Promise<void> {
        const context = this.executions.get(requestId);
        if (!context) {
            return;
        }

        context.abortController?.abort();
        this.cleanupExecution(requestId);
        this.emit('executionCancelled', { requestId });
    }

    private cleanupExecution(requestId: string): void {
        const context = this.executions.get(requestId);
        if (context?.resourceAllocation) {
            this.resourceOptimizer.releaseResources(requestId);
        }
        this.executions.delete(requestId);
    }

    public getActiveExecutions(): IExecutionContext[] {
        return Array.from(this.executions.values());
    }

    public getExecutionStats(): IExecutionStats {
        return { ...this.stats };
    }

    private updateStats(success: boolean, latency: number): void {
        this.stats.totalExecutions++;
        if (!success) {
            this.stats.failedExecutions++;
        }

        // Update average latency
        this.stats.averageLatency = (
            (this.stats.averageLatency * (this.stats.totalExecutions - 1) + latency) /
            this.stats.totalExecutions
        );

        // This would update resource utilization metrics
        this.updateResourceUtilization();
    }

    private updateResourceUtilization(): void {
        // This would integrate with actual resource monitoring
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[LLMExecutionManager]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        // Cancel all active executions
        for (const [requestId] of this.executions) {
            this.cancelExecution(requestId).catch(error => {
                this.logger.error(`Failed to cancel execution ${requestId}`, error);
            });
        }

        this.executions.clear();
        this.removeAllListeners();
    }
}
