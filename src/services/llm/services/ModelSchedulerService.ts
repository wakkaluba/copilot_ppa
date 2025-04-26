import { injectable, inject } from 'inversify';
import { ILogger } from '../../../utils/logger';
import { ModelResourceOptimizer } from './ModelResourceOptimizer';
import { ModelMetricsService } from './ModelMetricsService';
import { ModelEvents, SchedulingRequest, SchedulingResult, ScheduledTask } from '../types';
import { EventEmitter } from 'events';

@injectable()
export class ModelSchedulerService extends EventEmitter {
    private readonly activeSchedules = new Map<string, ScheduledTask[]>();
    private readonly schedulingHistory = new Map<string, SchedulingResult[]>();
    private readonly processing = new Set<string>();
    private readonly taskTimeout = 30000; // 30 seconds default timeout

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelResourceOptimizer) private readonly resourceOptimizer: ModelResourceOptimizer,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
    }

    public async scheduleModel(modelId: string, request: SchedulingRequest): Promise<SchedulingResult> {
        if (this.processing.has(modelId)) {
            throw new Error(`Scheduling already in progress for model ${modelId}`);
        }

        try {
            this.processing.add(modelId);
            this.emit(ModelEvents.SchedulingStarted, { modelId, request });

            const metrics = await this.metricsService.getMetrics(modelId);
            if (!metrics) {
                throw new Error(`No metrics available for model ${modelId}`);
            }

            const resources = await this.resourceOptimizer.getAvailableResources();
            const result = await this.createSchedule(modelId, request, metrics, resources);
            
            this.addToHistory(modelId, result);
            await this.applySchedule(modelId, result);

            this.emit(ModelEvents.SchedulingCompleted, { modelId, result });
            return result;

        } catch (error) {
            this.handleError('Scheduling failed', error);
            throw error;
        } finally {
            this.processing.delete(modelId);
        }
    }

    public getSchedule(modelId: string): ScheduledTask[] {
        return this.activeSchedules.get(modelId) || [];
    }

    public getSchedulingHistory(modelId: string): SchedulingResult[] {
        return this.schedulingHistory.get(modelId) || [];
    }

    private async createSchedule(
        modelId: string,
        request: SchedulingRequest,
        metrics: any,
        resources: any
    ): Promise<SchedulingResult> {
        const tasks = this.generateTasks(request, resources);
        const schedule = this.optimizeSchedule(tasks, metrics);

        return {
            modelId,
            timestamp: new Date(),
            schedule,
            resources: this.calculateResourceAllocation(schedule),
            efficiency: this.calculateEfficiencyScore(schedule, metrics),
            constraints: this.validateConstraints(schedule, request)
        };
    }

    private generateTasks(request: SchedulingRequest, resources: any): ScheduledTask[] {
        const tasks: ScheduledTask[] = [];
        const timeSlots = this.calculateTimeSlots(request);

        for (const slot of timeSlots) {
            tasks.push({
                id: crypto.randomUUID(),
                startTime: slot.start,
                endTime: slot.end,
                priority: request.priority || 'normal',
                resources: this.allocateResources(slot, resources),
                status: 'pending',
                timeout: this.taskTimeout
            });
        }

        return tasks;
    }

    private calculateTimeSlots(request: SchedulingRequest): Array<{start: number, end: number}> {
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

    private optimizeSchedule(tasks: ScheduledTask[], metrics: any): ScheduledTask[] {
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

    private calculateResourceAllocation(schedule: ScheduledTask[]): any {
        return schedule.reduce((total, task) => ({
            cpu: total.cpu + (task.resources.cpu || 0),
            memory: total.memory + (task.resources.memory || 0),
            gpu: total.gpu + (task.resources.gpu || 0)
        }), { cpu: 0, memory: 0, gpu: 0 });
    }

    private calculateEfficiencyScore(schedule: ScheduledTask[], metrics: any): number {
        const utilizationScore = this.calculateUtilizationScore(schedule);
        const performanceScore = this.calculatePerformanceScore(metrics);
        return (utilizationScore + performanceScore) / 2;
    }

    private calculateUtilizationScore(schedule: ScheduledTask[]): number {
        const totalResources = this.calculateResourceAllocation(schedule);
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

    private validateConstraints(schedule: ScheduledTask[], request: SchedulingRequest): string[] {
        const constraints: string[] = [];

        // Check time constraints
        if (this.exceedsTimeLimit(schedule, request)) {
            constraints.push('Schedule exceeds maximum time limit');
        }

        // Check resource constraints
        if (this.exceedsResourceLimits(schedule)) {
            constraints.push('Schedule exceeds available resources');
        }

        return constraints;
    }

    private exceedsTimeLimit(schedule: ScheduledTask[], request: SchedulingRequest): boolean {
        const duration = Math.max(...schedule.map(t => t.endTime)) - 
                        Math.min(...schedule.map(t => t.startTime));
        return duration > (request.maxDuration || Infinity);
    }

    private exceedsResourceLimits(schedule: ScheduledTask[]): boolean {
        const total = this.calculateResourceAllocation(schedule);
        const max = this.resourceOptimizer.getMaxResources();
        
        return total.cpu > max.cpu || 
               total.memory > max.memory || 
               total.gpu > max.gpu;
    }

    private async applySchedule(modelId: string, result: SchedulingResult): Promise<void> {
        this.activeSchedules.set(modelId, result.schedule);

        // Setup timeouts for each task
        result.schedule.forEach(task => {
            const delay = task.startTime - Date.now();
            if (delay > 0) {
                setTimeout(() => this.executeTask(modelId, task), delay);
            } else {
                this.executeTask(modelId, task);
            }
        });
    }

    private async executeTask(modelId: string, task: ScheduledTask): Promise<void> {
        try {
            task.status = 'running';
            this.emit(ModelEvents.TaskStarted, { modelId, taskId: task.id });

            // Apply resource limits
            await this.resourceOptimizer.applyLimits(modelId, task.resources);
            
            // Wait for task duration
            await new Promise(resolve => setTimeout(resolve, task.endTime - task.startTime));
            
            task.status = 'completed';
            this.emit(ModelEvents.TaskCompleted, { modelId, taskId: task.id });

        } catch (error) {
            task.status = 'failed';
            this.handleError(`Task execution failed: ${task.id}`, error);
            this.emit(ModelEvents.TaskFailed, { modelId, taskId: task.id, error });
        }
    }

    private addToHistory(modelId: string, result: SchedulingResult): void {
        const history = this.schedulingHistory.get(modelId) || [];
        history.push(result);
        while (history.length > 100) { // Keep last 100 results
            history.shift();
        }
        this.schedulingHistory.set(modelId, history);
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
    }

    public dispose(): void {
        this.removeAllListeners();
        this.activeSchedules.clear();
        this.schedulingHistory.clear();
        this.processing.clear();
    }
}
