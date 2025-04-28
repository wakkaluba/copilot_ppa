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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelScheduler = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types");
const ModelSystemManager_1 = require("./ModelSystemManager");
let ModelScheduler = class ModelScheduler {
    constructor(logger, systemManager, processingIntervalMs = 1000) {
        this.logger = logger;
        this.systemManager = systemManager;
        this.processingIntervalMs = processingIntervalMs;
        this.taskQueue = new Map();
        this.activeTasks = new Map();
        this.maxConcurrentTasks = 3;
        this.taskHistory = [];
        this.metrics = {
            totalTasks: 0,
            completedTasks: 0,
            failedTasks: 0,
            averageWaitTime: 0,
            averageProcessingTime: 0
        };
        this.processingInterval = null;
        this.startProcessing();
    }
    async scheduleTask(modelId, priority = 'normal', payload, timeoutMs) {
        const task = {
            id: crypto.randomUUID(),
            modelId,
            priority,
            timestamp: new Date(),
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
                if (!nextTask) {
                    break;
                }
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
exports.ModelScheduler = ModelScheduler;
exports.ModelScheduler = ModelScheduler = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelSystemManager_1.ModelSystemManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelSystemManager_1.ModelSystemManager, Object])
], ModelScheduler);
//# sourceMappingURL=ModelScheduler.js.map