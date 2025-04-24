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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelSchedulerManager = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelSchedulerManager = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelSchedulerManager = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelSchedulerManager = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        metricsManager;
        outputChannel;
        requestQueues = new Map();
        activeRequests = new Set();
        maxConcurrentRequests = 3;
        isProcessing = false;
        constructor(logger, metricsManager) {
            super();
            this.logger = logger;
            this.metricsManager = metricsManager;
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
    return ModelSchedulerManager = _classThis;
})();
exports.ModelSchedulerManager = ModelSchedulerManager;
//# sourceMappingURL=ModelSchedulerManager.js.map