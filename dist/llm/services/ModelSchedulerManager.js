"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSchedulerManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const types_1 = require("../types");
const ModelMetricsManager_1 = require("./ModelMetricsManager");
let ModelSchedulerManager = class ModelSchedulerManager extends events_1.EventEmitter {
    constructor(logger, metricsManager) {
        super();
        this.logger = logger;
        this.metricsManager = metricsManager;
        this.requestQueues = new Map();
        this.activeRequests = new Set();
        this.maxConcurrentRequests = 3;
        this.isProcessing = false;
        this.outputChannel = vscode.window.createOutputChannel('Model Scheduler');
        this.initializeQueues();
    }
    async scheduleRequest(request, priority = 'normal') {
        const requestId = request.id || crypto.randomUUID();
        try {
            const queue = this.requestQueues.get(priority);
            if (!queue) {
                throw new Error(`Invalid priority level: ${priority}`);
            }
            // Add request to appropriate queue
            queue.push({ ...request, id: requestId });
            this.emit('requestQueued', { requestId, priority });
            this.logRequestQueued(requestId, priority);
            // Start processing if not already running
            if (!this.isProcessing) {
                this.processQueues();
            }
            return requestId;
        }
        catch (error) {
            this.handleError('Failed to schedule request', error);
            throw error;
        }
    }
    cancelRequest(requestId) {
        // Check active requests first
        if (this.activeRequests.has(requestId)) {
            this.activeRequests.delete(requestId);
            this.emit('requestCancelled', { requestId });
            return true;
        }
        // Check queues
        for (const [priority, queue] of this.requestQueues.entries()) {
            const index = queue.findIndex(req => req.id === requestId);
            if (index !== -1) {
                queue.splice(index, 1);
                this.emit('requestCancelled', { requestId, priority });
                return true;
            }
        }
        return false;
    }
    async processQueues() {
        if (this.isProcessing) {
            return;
        }
        this.isProcessing = true;
        try {
            while (this.hasQueuedRequests()) {
                if (this.activeRequests.size >= this.maxConcurrentRequests) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    continue;
                }
                const request = this.getNextRequest();
                if (!request) {
                    continue;
                }
                this.activeRequests.add(request.id);
                this.emit('requestStarted', { requestId: request.id });
                this.processRequest(request).catch(error => {
                    this.handleError(`Failed to process request ${request.id}`, error);
                });
            }
        }
        catch (error) {
            this.handleError('Queue processing error', error);
        }
        finally {
            this.isProcessing = false;
        }
    }
    async processRequest(request) {
        const startTime = Date.now();
        try {
            await request.execute();
            const duration = Date.now() - startTime;
            this.metricsManager.recordRequestMetrics(request.modelId, {
                duration,
                success: true
            });
            this.emit('requestCompleted', {
                requestId: request.id,
                duration
            });
        }
        catch (error) {
            this.metricsManager.recordRequestMetrics(request.modelId, {
                duration: Date.now() - startTime,
                success: false
            });
            throw error;
        }
        finally {
            this.activeRequests.delete(request.id);
        }
    }
    getNextRequest() {
        const priorities = ['high', 'normal', 'low'];
        for (const priority of priorities) {
            const queue = this.requestQueues.get(priority);
            if (queue?.length) {
                return queue.shift();
            }
        }
        return undefined;
    }
    hasQueuedRequests() {
        return Array.from(this.requestQueues.values()).some(queue => queue.length > 0);
    }
    initializeQueues() {
        this.requestQueues.set('high', []);
        this.requestQueues.set('normal', []);
        this.requestQueues.set('low', []);
    }
    getQueueStatus() {
        const status = {
            high: 0,
            normal: 0,
            low: 0
        };
        for (const [priority, queue] of this.requestQueues.entries()) {
            status[priority] = queue.length;
        }
        return status;
    }
    getActiveRequestCount() {
        return this.activeRequests.size;
    }
    logRequestQueued(requestId, priority) {
        this.outputChannel.appendLine(`Request ${requestId} queued with priority ${priority}`);
        this.outputChannel.appendLine('Queue Status:');
        const status = this.getQueueStatus();
        Object.entries(status).forEach(([priority, count]) => {
            this.outputChannel.appendLine(`  ${priority}: ${count} requests`);
        });
    }
    handleError(message, error) {
        this.logger.error('[ModelSchedulerManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
    dispose() {
        this.outputChannel.dispose();
        this.removeAllListeners();
        // Cancel all active and queued requests
        this.activeRequests.clear();
        this.requestQueues.forEach(queue => queue.length = 0);
    }
};
exports.ModelSchedulerManager = ModelSchedulerManager;
exports.ModelSchedulerManager = ModelSchedulerManager = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(types_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsManager_1.ModelMetricsManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof types_1.ILogger !== "undefined" && types_1.ILogger) === "function" ? _a : Object, ModelMetricsManager_1.ModelMetricsManager])
], ModelSchedulerManager);
//# sourceMappingURL=ModelSchedulerManager.js.map