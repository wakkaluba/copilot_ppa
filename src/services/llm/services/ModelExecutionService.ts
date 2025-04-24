import { injectable, inject } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../../utils/logger';
import { ModelResourceOptimizer } from './ModelResourceOptimizer';
import { ModelMetricsService } from './ModelMetricsService';
import { ModelEvents, ExecutionRequest, ExecutionResult, ExecutedTask } from '../types';

@injectable()
export class ModelExecutionService extends EventEmitter {
    private readonly activeExecutions = new Map<string, ExecutedTask[]>();
    private readonly executionHistory = new Map<string, ExecutionResult[]>();
    private readonly processing = new Set<string>();
    private readonly executionTimeout = 30000; // 30 seconds default timeout
    private readonly maxConcurrentExecutions = 3;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelResourceOptimizer) private readonly resourceOptimizer: ModelResourceOptimizer,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
    }

    public async executeModel(modelId: string, request: ExecutionRequest): Promise<ExecutionResult> {
        if (this.processing.has(modelId)) {
            throw new Error(`Execution already in progress for model ${modelId}`);
        }

        if (this.getActiveExecutionCount() >= this.maxConcurrentExecutions) {
            throw new Error('Maximum concurrent executions reached');
        }

        try {
            this.processing.add(modelId);
            this.emit(ModelEvents.ExecutionStarted, { modelId, request });

            const metrics = await this.metricsService.getMetrics(modelId);
            if (!metrics) {
                throw new Error(`No metrics available for model ${modelId}`);
            }

            const resources = await this.resourceOptimizer.getAvailableResources();
            const result = await this.createExecution(modelId, request, metrics, resources);
            
            this.addToHistory(modelId, result);
            await this.trackExecution(modelId, result);

            this.emit(ModelEvents.ExecutionCompleted, { modelId, result });
            return result;

        } catch (error) {
            this.handleError('Execution failed', error);
            throw error;
        } finally {
            this.processing.delete(modelId);
        }
    }

    public getExecution(modelId: string): ExecutedTask[] {
        return this.activeExecutions.get(modelId) || [];
    }

    public getExecutionHistory(modelId: string): ExecutionResult[] {
        return this.executionHistory.get(modelId) || [];
    }

    private async createExecution(
        modelId: string,
        request: ExecutionRequest,
        metrics: any,
        resources: any
    ): Promise<ExecutionResult> {
        const tasks = this.generateTasks(request, resources);
        const execution = this.optimizeExecution(tasks, metrics);

        return {
            modelId,
            timestamp: Date.now(),
            execution,
            resources: this.calculateResourceAllocation(execution),
            performance: this.calculatePerformanceMetrics(execution, metrics),
            constraints: this.validateConstraints(execution, request)
        };
    }

    private generateTasks(request: ExecutionRequest, resources: any): ExecutedTask[] {
        const tasks: ExecutedTask[] = [];
        const timeSlots = this.calculateTimeSlots(request);

        for (const slot of timeSlots) {
            tasks.push({
                id: crypto.randomUUID(),
                startTime: slot.start,
                endTime: slot.end,
                priority: request.priority || 'normal',
                resources: this.allocateResources(slot, resources),
                status: 'pending',
                timeout: this.executionTimeout,
                metrics: {
                    cpu: 0,
                    memory: 0,
                    latency: 0
                }
            });
        }

        return tasks;
    }

    private calculateTimeSlots(request: ExecutionRequest): Array<{start: number, end: number}> {
        const slots = [];
        const now = Date.now();
        const duration = request.duration || 3600000; // 1 hour default
        const interval = request.interval || 300000; // 5 minutes default

        for (let start = now; start < now + duration; start += interval) {
            slots.push({
                start,
                end: start + interval
            });
        }

        return slots;
    }

    private allocateResources(slot: any, available: any): any {
        // Implementation would calculate optimal resource allocation
        return {
            cpu: Math.min(available.cpu * 0.8, 2),
            memory: Math.min(available.memory * 0.8, 2048),
            gpu: available.gpu ? 1 : 0
        };
    }

    private optimizeExecution(tasks: ExecutedTask[], metrics: any): ExecutedTask[] {
        return tasks.map(task => {
            const optimized = { ...task };
            
            // Adjust based on metrics
            optimized.resources = this.optimizeResources(task.resources, metrics);
            
            return optimized;
        });
    }

    private optimizeResources(resources: any, metrics: any): any {
        // Implementation would optimize resource allocation based on metrics
        return {
            ...resources,
            scalingFactor: this.calculateScalingFactor(metrics)
        };
    }

    private calculateScalingFactor(metrics: any): number {
        const utilization = metrics.averageUtilization || 0.5;
        return Math.max(0.5, Math.min(1.5, 1 / utilization));
    }

    private calculateResourceAllocation(execution: ExecutedTask[]): any {
        return execution.reduce((total, task) => ({
            cpu: total.cpu + (task.resources.cpu || 0),
            memory: total.memory + (task.resources.memory || 0),
            gpu: total.gpu + (task.resources.gpu || 0)
        }), { cpu: 0, memory: 0, gpu: 0 });
    }

    private calculatePerformanceMetrics(execution: ExecutedTask[], metrics: any): any {
        const utilizationScore = this.calculateUtilizationScore(execution);
        const performanceScore = this.calculatePerformanceScore(metrics);
        const throughputScore = this.calculateThroughputScore(execution);

        return {
            utilizationScore,
            performanceScore,
            throughputScore,
            overallScore: (utilizationScore + performanceScore + throughputScore) / 3
        };
    }

    private calculateUtilizationScore(execution: ExecutedTask[]): number {
        const totalResources = this.calculateResourceAllocation(execution);
        const maxResources = this.resourceOptimizer.getMaxResources();
        
        return 1 - Math.abs(1 - (
            totalResources.cpu / maxResources.cpu +
            totalResources.memory / maxResources.memory +
            totalResources.gpu / maxResources.gpu
        ) / 3);
    }

    private calculatePerformanceScore(metrics: any): number {
        const latencyScore = 1 - Math.min(1, metrics.averageLatency / 1000);
        const throughputScore = Math.min(1, metrics.throughput / 100);
        return (latencyScore + throughputScore) / 2;
    }

    private calculateThroughputScore(execution: ExecutedTask[]): number {
        const totalTime = Math.max(...execution.map(t => t.endTime)) - 
                         Math.min(...execution.map(t => t.startTime));
        const tasksPerSecond = execution.length / (totalTime / 1000);
        return Math.min(1, tasksPerSecond / 10); // Normalize to max 10 tasks/second
    }

    private validateConstraints(execution: ExecutedTask[], request: ExecutionRequest): string[] {
        const constraints: string[] = [];

        // Check time constraints
        if (this.exceedsTimeLimit(execution, request)) {
            constraints.push('Execution exceeds maximum time limit');
        }

        // Check resource constraints
        if (this.exceedsResourceLimits(execution)) {
            constraints.push('Execution exceeds available resources');
        }

        return constraints;
    }

    private exceedsTimeLimit(execution: ExecutedTask[], request: ExecutionRequest): boolean {
        const duration = Math.max(...execution.map(t => t.endTime)) - 
                        Math.min(...execution.map(t => t.startTime));
        return duration > (request.maxDuration || Infinity);
    }

    private exceedsResourceLimits(execution: ExecutedTask[]): boolean {
        const total = this.calculateResourceAllocation(execution);
        const max = this.resourceOptimizer.getMaxResources();
        
        return total.cpu > max.cpu || 
               total.memory > max.memory || 
               total.gpu > max.gpu;
    }

    private async trackExecution(modelId: string, result: ExecutionResult): Promise<void> {
        this.activeExecutions.set(modelId, result.execution);

        // Setup monitoring for each task
        result.execution.forEach(task => {
            const startDelay = task.startTime - Date.now();
            if (startDelay > 0) {
                setTimeout(() => this.monitorTask(modelId, task), startDelay);
            } else {
                this.monitorTask(modelId, task);
            }
        });
    }

    private async monitorTask(modelId: string, task: ExecutedTask): Promise<void> {
        try {
            task.status = 'running';
            this.emit(ModelEvents.TaskStarted, { modelId, taskId: task.id });

            // Apply resource limits and monitor usage
            await this.resourceOptimizer.applyLimits(modelId, task.resources);
            
            // Monitor task execution
            let monitoring = true;
            const interval = setInterval(() => {
                if (monitoring) {
                    this.updateTaskMetrics(task);
                }
            }, 1000);

            // Wait for task duration
            await new Promise(resolve => setTimeout(resolve, task.endTime - task.startTime));
            
            monitoring = false;
            clearInterval(interval);

            task.status = 'completed';
            this.emit(ModelEvents.TaskCompleted, { modelId, taskId: task.id });

        } catch (error) {
            task.status = 'failed';
            this.handleError(`Task execution failed: ${task.id}`, error);
            this.emit(ModelEvents.TaskFailed, { modelId, taskId: task.id, error });
        }
    }

    private updateTaskMetrics(task: ExecutedTask): void {
        const currentMetrics = this.resourceOptimizer.getCurrentUsage();
        task.metrics = {
            cpu: currentMetrics.cpu,
            memory: currentMetrics.memory,
            latency: Date.now() - task.startTime
        };
    }

    private getActiveExecutionCount(): number {
        return this.processing.size;
    }

    private addToHistory(modelId: string, result: ExecutionResult): void {
        const history = this.executionHistory.get(modelId) || [];
        history.push(result);
        while (history.length > 100) { // Keep last 100 results
            history.shift();
        }
        this.executionHistory.set(modelId, history);
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
    }

    public dispose(): void {
        this.removeAllListeners();
        this.activeExecutions.clear();
        this.executionHistory.clear();
        this.processing.clear();
    }
}
