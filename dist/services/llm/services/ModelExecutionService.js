"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelExecutionService = void 0;
const inversify_1 = require("inversify");
const events_1 = require("events");
const logger_1 = require("../../../utils/logger");
const ModelResourceOptimizer_1 = require("./ModelResourceOptimizer");
const ModelMetricsService_1 = require("./ModelMetricsService");
const types_1 = require("../types");
let ModelExecutionService = class ModelExecutionService extends events_1.EventEmitter {
    logger;
    resourceOptimizer;
    metricsService;
    activeExecutions = new Map();
    executionHistory = new Map();
    processing = new Set();
    executionTimeout = 30000; // 30 seconds default timeout
    maxConcurrentExecutions = 3;
    constructor(logger, resourceOptimizer, metricsService) {
        super();
        this.logger = logger;
        this.resourceOptimizer = resourceOptimizer;
        this.metricsService = metricsService;
    }
    async executeModel(modelId, request) {
        if (this.processing.has(modelId)) {
            throw new Error(`Execution already in progress for model ${modelId}`);
        }
        if (this.getActiveExecutionCount() >= this.maxConcurrentExecutions) {
            throw new Error('Maximum concurrent executions reached');
        }
        try {
            this.processing.add(modelId);
            this.emit(types_1.ModelEvents.ExecutionStarted, { modelId, request });
            const metrics = await this.metricsService.getMetrics(modelId);
            if (!metrics) {
                throw new Error(`No metrics available for model ${modelId}`);
            }
            const resources = await this.resourceOptimizer.getAvailableResources();
            const result = await this.createExecution(modelId, request, metrics, resources);
            this.addToHistory(modelId, result);
            await this.trackExecution(modelId, result);
            this.emit(types_1.ModelEvents.ExecutionCompleted, { modelId, result });
            return result;
        }
        catch (error) {
            this.handleError('Execution failed', error);
            throw error;
        }
        finally {
            this.processing.delete(modelId);
        }
    }
    getExecution(modelId) {
        return this.activeExecutions.get(modelId) || [];
    }
    getExecutionHistory(modelId) {
        return this.executionHistory.get(modelId) || [];
    }
    async createExecution(modelId, request, metrics, resources) {
        const tasks = this.generateTasks(request, resources);
        const execution = this.optimizeExecution(tasks, metrics);
        return {
            modelId,
            timestamp: new Date(),
            execution,
            resources: this.calculateResourceAllocation(execution),
            performance: this.calculatePerformanceMetrics(execution, metrics),
            constraints: this.validateConstraints(execution, request)
        };
    }
    generateTasks(request, resources) {
        const tasks = [];
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
    calculateTimeSlots(request) {
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
    allocateResources(slot, available) {
        // Implementation would calculate optimal resource allocation
        return {
            cpu: Math.min(available.cpu * 0.8, 2),
            memory: Math.min(available.memory * 0.8, 2048),
            gpu: available.gpu ? 1 : 0
        };
    }
    optimizeExecution(tasks, metrics) {
        return tasks.map(task => {
            const optimized = { ...task };
            // Adjust based on metrics
            optimized.resources = this.optimizeResources(task.resources, metrics);
            return optimized;
        });
    }
    optimizeResources(resources, metrics) {
        // Implementation would optimize resource allocation based on metrics
        return {
            ...resources,
            scalingFactor: this.calculateScalingFactor(metrics)
        };
    }
    calculateScalingFactor(metrics) {
        const utilization = metrics.averageUtilization || 0.5;
        return Math.max(0.5, Math.min(1.5, 1 / utilization));
    }
    calculateResourceAllocation(execution) {
        return execution.reduce((total, task) => ({
            cpu: total.cpu + (task.resources.cpu || 0),
            memory: total.memory + (task.resources.memory || 0),
            gpu: total.gpu + (task.resources.gpu || 0)
        }), { cpu: 0, memory: 0, gpu: 0 });
    }
    calculatePerformanceMetrics(execution, metrics) {
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
    calculateUtilizationScore(execution) {
        const totalResources = this.calculateResourceAllocation(execution);
        const maxResources = this.resourceOptimizer.getMaxResources();
        return 1 - Math.abs(1 - (totalResources.cpu / maxResources.cpu +
            totalResources.memory / maxResources.memory +
            totalResources.gpu / maxResources.gpu) / 3);
    }
    calculatePerformanceScore(metrics) {
        const latencyScore = 1 - Math.min(1, metrics.averageLatency / 1000);
        const throughputScore = Math.min(1, metrics.throughput / 100);
        return (latencyScore + throughputScore) / 2;
    }
    calculateThroughputScore(execution) {
        const totalTime = Math.max(...execution.map(t => t.endTime)) -
            Math.min(...execution.map(t => t.startTime));
        const tasksPerSecond = execution.length / (totalTime / 1000);
        return Math.min(1, tasksPerSecond / 10); // Normalize to max 10 tasks/second
    }
    validateConstraints(execution, request) {
        const constraints = [];
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
    exceedsTimeLimit(execution, request) {
        const duration = Math.max(...execution.map(t => t.endTime)) -
            Math.min(...execution.map(t => t.startTime));
        return duration > (request.maxDuration || Infinity);
    }
    exceedsResourceLimits(execution) {
        const total = this.calculateResourceAllocation(execution);
        const max = this.resourceOptimizer.getMaxResources();
        return total.cpu > max.cpu ||
            total.memory > max.memory ||
            total.gpu > max.gpu;
    }
    async trackExecution(modelId, result) {
        this.activeExecutions.set(modelId, result.execution);
        // Setup monitoring for each task
        result.execution.forEach(task => {
            const startDelay = task.startTime - Date.now();
            if (startDelay > 0) {
                setTimeout(() => this.monitorTask(modelId, task), startDelay);
            }
            else {
                this.monitorTask(modelId, task);
            }
        });
    }
    async monitorTask(modelId, task) {
        try {
            task.status = 'running';
            this.emit(types_1.ModelEvents.TaskStarted, { modelId, taskId: task.id });
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
            this.emit(types_1.ModelEvents.TaskCompleted, { modelId, taskId: task.id });
        }
        catch (error) {
            task.status = 'failed';
            this.handleError(`Task execution failed: ${task.id}`, error);
            this.emit(types_1.ModelEvents.TaskFailed, { modelId, taskId: task.id, error });
        }
    }
    updateTaskMetrics(task) {
        const currentMetrics = this.resourceOptimizer.getCurrentUsage();
        task.metrics = {
            cpu: currentMetrics.cpu,
            memory: currentMetrics.memory,
            latency: Date.now() - task.startTime
        };
    }
    getActiveExecutionCount() {
        return this.processing.size;
    }
    addToHistory(modelId, result) {
        const history = this.executionHistory.get(modelId) || [];
        history.push(result);
        while (history.length > 100) { // Keep last 100 results
            history.shift();
        }
        this.executionHistory.set(modelId, history);
    }
    handleError(message, error) {
        this.logger.error(message, { error });
    }
    dispose() {
        this.removeAllListeners();
        this.activeExecutions.clear();
        this.executionHistory.clear();
        this.processing.clear();
    }
};
exports.ModelExecutionService = ModelExecutionService;
exports.ModelExecutionService = ModelExecutionService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelResourceOptimizer_1.ModelResourceOptimizer)),
    __param(2, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof ModelResourceOptimizer_1.ModelResourceOptimizer !== "undefined" && ModelResourceOptimizer_1.ModelResourceOptimizer) === "function" ? _b : Object, ModelMetricsService_1.ModelMetricsService])
], ModelExecutionService);
//# sourceMappingURL=ModelExecutionService.js.map