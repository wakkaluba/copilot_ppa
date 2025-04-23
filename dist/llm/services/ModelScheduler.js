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
exports.ModelScheduler = void 0;
const inversify_1 = require("inversify");
let ModelScheduler = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    var ModelScheduler = class {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelScheduler = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        systemManager;
        processingIntervalMs;
        taskQueue = new Map();
        activeTasks = new Map();
        maxConcurrentTasks = 3;
        taskHistory = [];
        metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageWaitTime: 0,
            averageProcessingTime: 0
        };
        processingInterval = null;
        constructor(logger, systemManager, processingIntervalMs = 1000) {
            this.logger = logger;
            this.systemManager = systemManager;
            this.processingIntervalMs = processingIntervalMs;
            this.startProcessing();
        }
        async scheduleTask(modelId, priority = 'normal', payload, timeoutMs) {
            const task = {
                id: crypto.randomUUID(),
                modelId,
                priority,
                timestamp: Date.now(),
                timeoutMs,
                status: 'pending',
                payload
            };
            if (!this.taskQueue.has(priority)) {
                this.taskQueue.set(priority, []);
            }
            this.taskQueue.get(priority)?.push(task);
            this.metrics.totalTasks++;
            this.logger.info('ModelScheduler', `Scheduled task ${task.id} for model ${modelId} with priority ${priority}`);
            return task.id;
        }
        async processTasks() {
            try {
                while (this.activeTasks.size < this.maxConcurrentTasks) {
                    const nextTask = this.getNextTask();
                    if (!nextTask)
                        break;
                    await this.executeTask(nextTask);
                }
            }
            catch (error) {
                this.handleError('Error processing tasks', error);
            }
        }
        getNextTask() {
            // Try priorities in order: high, normal, low
            const priorities = ['high', 'normal', 'low'];
            for (const priority of priorities) {
                const queue = this.taskQueue.get(priority);
                if (queue?.length) {
                    return queue.shift();
                }
            }
            return undefined;
        }
        async executeTask(task) {
            try {
                task.status = 'running';
                this.activeTasks.set(task.id, task);
                // Set up timeout if specified
                const timeoutPromise = task.timeoutMs ?
                    new Promise((_, reject) => setTimeout(() => reject(new Error(`Task ${task.id} timed out after ${task.timeoutMs}ms`)), task.timeoutMs)) :
                    null;
                const executionPromise = this.runTask(task);
                // Execute with timeout if specified
                await Promise.race([
                    executionPromise,
                    timeoutPromise
                ].filter(Boolean));
                task.status = 'completed';
                this.metrics.completedTasks++;
            }
            catch (error) {
                task.status = 'failed';
                this.metrics.failedTasks++;
                this.handleError(`Failed to execute task ${task.id}`, error);
            }
            finally {
                this.activeTasks.delete(task.id);
                this.taskHistory.push(task);
                this.updateMetrics(task);
            }
        }
        async runTask(task) {
            // Implementation would depend on the specific task type
            // This is a placeholder for actual task execution
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
        updateMetrics(task) {
            const waitTime = task.timestamp ? (Date.now() - task.timestamp) : 0;
            // Update average wait time
            this.metrics.averageWaitTime = ((this.metrics.averageWaitTime * (this.metrics.totalTasks - 1) + waitTime) /
                this.metrics.totalTasks);
            // Update average processing time if task completed
            if (task.status === 'completed') {
                const processingTime = Date.now() - task.timestamp;
                this.metrics.averageProcessingTime = ((this.metrics.averageProcessingTime * (this.metrics.completedTasks - 1) + processingTime) /
                    this.metrics.completedTasks);
            }
        }
        getTaskStatus(taskId) {
            return (this.activeTasks.get(taskId) ||
                this.taskHistory.find(t => t.id === taskId));
        }
        getMetrics() {
            return { ...this.metrics };
        }
        startProcessing() {
            if (this.processingInterval) {
                return;
            }
            this.processingInterval = setInterval(() => this.processTasks(), this.processingIntervalMs);
        }
        stopProcessing() {
            if (this.processingInterval) {
                clearInterval(this.processingInterval);
                this.processingInterval = null;
            }
        }
        handleError(message, error) {
            this.logger.error('ModelScheduler', message, error);
        }
        dispose() {
            this.stopProcessing();
            this.taskQueue.clear();
            this.activeTasks.clear();
            this.taskHistory.length = 0;
        }
    };
    return ModelScheduler = _classThis;
})();
exports.ModelScheduler = ModelScheduler;
//# sourceMappingURL=ModelScheduler.js.map