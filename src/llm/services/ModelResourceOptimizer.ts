import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest } from '../types';

export interface IResourceAllocation {
    requestId: string;
    modelId: string;
    memory: number;
    cpu: number;
    gpu?: number;
    allocated: boolean;
    startTime: number;
    endTime?: number;
}

export interface IResourceUsage {
    memory: {
        total: number;
        used: number;
        available: number;
    };
    cpu: {
        total: number;
        used: number;
        available: number;
    };
    gpu?: {
        total: number;
        used: number;
        available: number;
    };
}

export interface IResourceConstraints {
    maxMemoryPerRequest: number;
    maxCpuPerRequest: number;
    maxGpuPerRequest?: number;
    maxConcurrentRequests: number;
}

export interface IOptimizationSuggestion {
    type: 'scale_up' | 'scale_down' | 'rebalance';
    priority: 'high' | 'medium' | 'low';
    resource: 'memory' | 'cpu' | 'gpu';
    currentValue: number;
    suggestedValue: number;
    reason: string;
}

@injectable()
export class ModelResourceOptimizer extends EventEmitter implements IModelResourceOptimizer {
    private readonly allocations = new Map<string, IResourceAllocation>();
    private readonly constraints: IResourceConstraints = {
        maxMemoryPerRequest: 1024 * 1024 * 1024, // 1GB
        maxCpuPerRequest: 1,
        maxGpuPerRequest: 1,
        maxConcurrentRequests: 10
    };

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async allocateResources(request: ILLMRequest): Promise<IResourceAllocation> {
        try {
            await this.waitForAvailableResources();

            const allocation: IResourceAllocation = {
                requestId: request.id,
                modelId: request.model,
                memory: this.calculateMemoryRequirement(request),
                cpu: this.calculateCpuRequirement(request),
                gpu: this.calculateGpuRequirement(request),
                allocated: false,
                startTime: Date.now()
            };

            if (!this.validateAllocation(allocation)) {
                throw new Error('Resource allocation exceeds constraints');
            }

            allocation.allocated = true;
            this.allocations.set(request.id, allocation);

            this.emit('resourcesAllocated', allocation);
            return allocation;
        } catch (error) {
            this.handleError(`Failed to allocate resources for request ${request.id}`, error as Error);
            throw error;
        }
    }

    public async releaseResources(requestId: string): Promise<void> {
        try {
            const allocation = this.allocations.get(requestId);
            if (!allocation) {
                throw new Error(`No allocation found for request ${requestId}`);
            }

            allocation.endTime = Date.now();
            allocation.allocated = false;
            this.allocations.delete(requestId);

            this.emit('resourcesReleased', {
                requestId,
                duration: allocation.endTime - allocation.startTime
            });
        } catch (error) {
            this.handleError(`Failed to release resources for request ${requestId}`, error as Error);
            throw error;
        }
    }

    private calculateMemoryRequirement(request: ILLMRequest): number {
        // This would implement actual memory calculation based on model and request parameters
        return Math.min(
            this.constraints.maxMemoryPerRequest,
            1024 * 1024 * 100 // 100MB default
        );
    }

    private calculateCpuRequirement(request: ILLMRequest): number {
        // This would implement actual CPU calculation based on model and request parameters
        return Math.min(
            this.constraints.maxCpuPerRequest,
            0.5 // 0.5 CPU cores default
        );
    }

    private calculateGpuRequirement(request: ILLMRequest): number | undefined {
        // This would implement actual GPU calculation based on model and request parameters
        if (!this.constraints.maxGpuPerRequest) {
            return undefined;
        }

        return Math.min(
            this.constraints.maxGpuPerRequest,
            0.5 // 0.5 GPU units default
        );
    }

    private validateAllocation(allocation: IResourceAllocation): boolean {
        if (allocation.memory > this.constraints.maxMemoryPerRequest) {
            return false;
        }

        if (allocation.cpu > this.constraints.maxCpuPerRequest) {
            return false;
        }

        if (allocation.gpu && this.constraints.maxGpuPerRequest &&
            allocation.gpu > this.constraints.maxGpuPerRequest) {
            return false;
        }

        const activeAllocations = Array.from(this.allocations.values())
            .filter(a => a.allocated);

        if (activeAllocations.length >= this.constraints.maxConcurrentRequests) {
            return false;
        }

        return true;
    }

    private async waitForAvailableResources(): Promise<void> {
        // This would implement actual resource waiting logic
        return Promise.resolve();
    }

    public getCurrentResourceUsage(): IResourceUsage {
        const activeAllocations = Array.from(this.allocations.values())
            .filter(a => a.allocated);

        const usage: IResourceUsage = {
            memory: {
                total: this.constraints.maxMemoryPerRequest * this.constraints.maxConcurrentRequests,
                used: activeAllocations.reduce((sum, a) => sum + a.memory, 0),
                available: 0
            },
            cpu: {
                total: this.constraints.maxCpuPerRequest * this.constraints.maxConcurrentRequests,
                used: activeAllocations.reduce((sum, a) => sum + a.cpu, 0),
                available: 0
            }
        };

        usage.memory.available = usage.memory.total - usage.memory.used;
        usage.cpu.available = usage.cpu.total - usage.cpu.used;

        if (this.constraints.maxGpuPerRequest) {
            usage.gpu = {
                total: this.constraints.maxGpuPerRequest * this.constraints.maxConcurrentRequests,
                used: activeAllocations.reduce((sum, a) => sum + (a.gpu || 0), 0),
                available: 0
            };
            usage.gpu.available = usage.gpu.total - usage.gpu.used;
        }

        return usage;
    }

    public getResourceConstraints(): IResourceConstraints {
        return { ...this.constraints };
    }

    public updateResourceConstraints(updates: Partial<IResourceConstraints>): void {
        Object.assign(this.constraints, updates);
        this.emit('constraintsUpdated', this.constraints);
    }

    public getActiveAllocations(): IResourceAllocation[] {
        return Array.from(this.allocations.values())
            .filter(a => a.allocated);
    }

    public getOptimizationSuggestions(): IOptimizationSuggestion[] {
        const usage = this.getCurrentResourceUsage();
        const suggestions: IOptimizationSuggestion[] = [];

        // Check memory utilization
        const memoryUtilization = usage.memory.used / usage.memory.total;
        if (memoryUtilization > 0.9) {
            suggestions.push({
                type: 'scale_up',
                priority: 'high',
                resource: 'memory',
                currentValue: this.constraints.maxMemoryPerRequest,
                suggestedValue: this.constraints.maxMemoryPerRequest * 1.5,
                reason: 'High memory utilization'
            });
        } else if (memoryUtilization < 0.3) {
            suggestions.push({
                type: 'scale_down',
                priority: 'medium',
                resource: 'memory',
                currentValue: this.constraints.maxMemoryPerRequest,
                suggestedValue: this.constraints.maxMemoryPerRequest * 0.75,
                reason: 'Low memory utilization'
            });
        }

        // Similar checks would be implemented for CPU and GPU

        return suggestions;
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelResourceOptimizer]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        // Release all allocations
        for (const [requestId] of this.allocations) {
            this.releaseResources(requestId).catch(error => {
                this.logger.error(`Failed to release resources for ${requestId}`, error);
            });
        }

        this.allocations.clear();
        this.removeAllListeners();
    }
}
