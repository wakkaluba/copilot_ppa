"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSchedulerService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types");
const events_1 = require("events");
let ModelSchedulerService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelSchedulerService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelSchedulerService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        resourceOptimizer;
        metricsService;
        activeSchedules = new Map();
        schedulingHistory = new Map();
        processing = new Set();
        taskTimeout = 30000; // 30 seconds default timeout
        constructor(logger, resourceOptimizer, metricsService) {
            super();
            this.logger = logger;
            this.resourceOptimizer = resourceOptimizer;
            this.metricsService = metricsService;
        }
        async scheduleModel(modelId, request) {
            if (this.processing.has(modelId)) {
                throw new Error(`Scheduling already in progress for model ${modelId}`);
            }
            try {
                this.processing.add(modelId);
                this.emit(types_1.ModelEvents.SchedulingStarted, { modelId, request });
                const metrics = await this.metricsService.getMetrics(modelId);
                if (!metrics) {
                    throw new Error(`No metrics available for model ${modelId}`);
                }
                const resources = await this.resourceOptimizer.getAvailableResources();
                const result = await this.createSchedule(modelId, request, metrics, resources);
                this.addToHistory(modelId, result);
                await this.applySchedule(modelId, result);
                this.emit(types_1.ModelEvents.SchedulingCompleted, { modelId, result });
                return result;
            }
            catch (error) {
                this.handleError('Scheduling failed', error);
                throw error;
            }
            finally {
                this.processing.delete(modelId);
            }
        }
        getSchedule(modelId) {
            return this.activeSchedules.get(modelId) || [];
        }
        getSchedulingHistory(modelId) {
            return this.schedulingHistory.get(modelId) || [];
        }
        async createSchedule(modelId, request, metrics, resources) {
            const tasks = this.generateTasks(request, resources);
            const schedule = this.optimizeSchedule(tasks, metrics);
            return {
                modelId,
                timestamp: Date.now(),
                schedule,
                resources: this.calculateResourceAllocation(schedule),
                efficiency: this.calculateEfficiencyScore(schedule, metrics),
                constraints: this.validateConstraints(schedule, request)
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
                    timeout: this.taskTimeout
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
        optimizeSchedule(tasks, metrics) {
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
        calculateResourceAllocation(schedule) {
            return schedule.reduce((total, task) => ({
                cpu: total.cpu + (task.resources.cpu || 0),
                memory: total.memory + (task.resources.memory || 0),
                gpu: total.gpu + (task.resources.gpu || 0)
            }), { cpu: 0, memory: 0, gpu: 0 });
        }
        calculateEfficiencyScore(schedule, metrics) {
            const utilizationScore = this.calculateUtilizationScore(schedule);
            const performanceScore = this.calculatePerformanceScore(metrics);
            return (utilizationScore + performanceScore) / 2;
        }
        calculateUtilizationScore(schedule) {
            const totalResources = this.calculateResourceAllocation(schedule);
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
        validateConstraints(schedule, request) {
            const constraints = [];
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
        exceedsTimeLimit(schedule, request) {
            const duration = Math.max(...schedule.map(t => t.endTime)) -
                Math.min(...schedule.map(t => t.startTime));
            return duration > (request.maxDuration || Infinity);
        }
        exceedsResourceLimits(schedule) {
            const total = this.calculateResourceAllocation(schedule);
            const max = this.resourceOptimizer.getMaxResources();
            return total.cpu > max.cpu ||
                total.memory > max.memory ||
                total.gpu > max.gpu;
        }
        async applySchedule(modelId, result) {
            this.activeSchedules.set(modelId, result.schedule);
            // Setup timeouts for each task
            result.schedule.forEach(task => {
                const delay = task.startTime - Date.now();
                if (delay > 0) {
                    setTimeout(() => this.executeTask(modelId, task), delay);
                }
                else {
                    this.executeTask(modelId, task);
                }
            });
        }
        async executeTask(modelId, task) {
            try {
                task.status = 'running';
                this.emit(types_1.ModelEvents.TaskStarted, { modelId, taskId: task.id });
                // Apply resource limits
                await this.resourceOptimizer.applyLimits(modelId, task.resources);
                // Wait for task duration
                await new Promise(resolve => setTimeout(resolve, task.endTime - task.startTime));
                task.status = 'completed';
                this.emit(types_1.ModelEvents.TaskCompleted, { modelId, taskId: task.id });
            }
            catch (error) {
                task.status = 'failed';
                this.handleError(`Task execution failed: ${task.id}`, error);
                this.emit(types_1.ModelEvents.TaskFailed, { modelId, taskId: task.id, error });
            }
        }
        addToHistory(modelId, result) {
            const history = this.schedulingHistory.get(modelId) || [];
            history.push(result);
            while (history.length > 100) { // Keep last 100 results
                history.shift();
            }
            this.schedulingHistory.set(modelId, history);
        }
        handleError(message, error) {
            this.logger.error(message, { error });
        }
        dispose() {
            this.removeAllListeners();
            this.activeSchedules.clear();
            this.schedulingHistory.clear();
            this.processing.clear();
        }
    };
    return ModelSchedulerService = _classThis;
})();
exports.ModelSchedulerService = ModelSchedulerService;
//# sourceMappingURL=ModelSchedulerService.js.map