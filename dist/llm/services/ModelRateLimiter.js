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
exports.ModelRateLimiter = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelRateLimiter = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelRateLimiter = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelRateLimiter = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
        logger;
        buckets = new Map();
        queues = new Map();
        configs = new Map();
        outputChannel;
        cleanupInterval;
        constructor(logger) {
            super();
            this.logger = logger;
            this.outputChannel = vscode.window.createOutputChannel('Model Rate Limiter');
            this.cleanupInterval = setInterval(() => this.cleanupStaleRequests(), 60000);
        }
        async configureModel(modelId, config) {
            try {
                const defaultConfig = {
                    requestsPerSecond: 10,
                    burstLimit: 20,
                    maxQueueSize: 100,
                    timeWindowMs: 3600000 // 1 hour
                };
                this.configs.set(modelId, {
                    ...defaultConfig,
                    ...config
                });
                this.logConfigUpdate(modelId);
            }
            catch (error) {
                this.handleError(`Failed to configure model ${modelId}`, error);
                throw error;
            }
        }
        async acquireToken(modelId, timeout = 5000) {
            try {
                const config = this.configs.get(modelId);
                if (!config) {
                    throw new Error(`Model ${modelId} not configured for rate limiting`);
                }
                const bucket = this.getOrCreateBucket(modelId, config);
                if (this.checkAndUpdateQuota(bucket, config)) {
                    if (this.tryAcquireToken(bucket, config)) {
                        return;
                    }
                    return this.enqueueRequest(modelId, timeout);
                }
                throw new Error(`Quota exceeded for model ${modelId}`);
            }
            catch (error) {
                this.handleError(`Failed to acquire token for model ${modelId}`, error);
                throw error;
            }
        }
        getOrCreateBucket(modelId, config) {
            let bucket = this.buckets.get(modelId);
            if (!bucket) {
                bucket = {
                    tokens: config.burstLimit,
                    lastRefill: Date.now(),
                    quota: config.quotaLimit ? {
                        remaining: config.quotaLimit,
                        resetTime: Date.now() + (config.timeWindowMs || 3600000)
                    } : undefined
                };
                this.buckets.set(modelId, bucket);
                return bucket;
            }
            const now = Date.now();
            const timePassed = (now - bucket.lastRefill) / 1000;
            const newTokens = timePassed * config.requestsPerSecond;
            bucket.tokens = Math.min(config.burstLimit, bucket.tokens + newTokens);
            bucket.lastRefill = now;
            return bucket;
        }
        tryAcquireToken(bucket, config) {
            if (bucket.tokens >= 1) {
                bucket.tokens--;
                return true;
            }
            return false;
        }
        checkAndUpdateQuota(bucket, config) {
            if (!bucket.quota || !config.quotaLimit) {
                return true;
            }
            const now = Date.now();
            if (now > bucket.quota.resetTime) {
                bucket.quota.remaining = config.quotaLimit;
                bucket.quota.resetTime = now + (config.timeWindowMs || 3600000);
            }
            if (bucket.quota.remaining > 0) {
                bucket.quota.remaining--;
                return true;
            }
            return false;
        }
        async enqueueRequest(modelId, timeout) {
            const queue = this.queues.get(modelId) || [];
            const config = this.configs.get(modelId);
            if (!config) {
                throw new Error(`Model ${modelId} not configured for rate limiting`);
            }
            if (queue.length >= config.maxQueueSize) {
                throw new Error(`Rate limit queue full for model ${modelId}`);
            }
            if (!this.queues.has(modelId)) {
                this.queues.set(modelId, []);
            }
            return new Promise((resolve, reject) => {
                const requestId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                const timeoutId = setTimeout(() => {
                    this.removeRequest(modelId, requestId);
                    reject(new Error('Rate limit request timeout'));
                }, timeout);
                queue.push({ id: requestId, timestamp: Date.now(), resolve, reject, timeoutId });
                this.logQueueUpdate(modelId, queue.length);
            });
        }
        removeRequest(modelId, requestId) {
            const queue = this.queues.get(modelId);
            if (!queue)
                return;
            const index = queue.findIndex(r => r.id === requestId);
            if (index !== -1) {
                clearTimeout(queue[index].timeoutId);
                queue.splice(index, 1);
            }
        }
        processQueue(modelId) {
            const queue = this.queues.get(modelId);
            const config = this.configs.get(modelId);
            if (!queue || !config)
                return;
            const bucket = this.getOrCreateBucket(modelId, config);
            while (queue.length > 0 && this.tryAcquireToken(bucket, config)) {
                const request = queue.shift();
                if (request) {
                    clearTimeout(request.timeoutId);
                    request.resolve();
                }
            }
            this.logQueueUpdate(modelId, queue.length);
        }
        cleanupStaleRequests() {
            const now = Date.now();
            for (const [modelId, queue] of this.queues.entries()) {
                const staleTimeout = 300000; // 5 minutes
                const filtered = queue.filter(request => {
                    const isStale = (now - request.timestamp) > staleTimeout;
                    if (isStale) {
                        clearTimeout(request.timeoutId);
                        request.reject(new Error('Request expired'));
                    }
                    return !isStale;
                });
                this.queues.set(modelId, filtered);
            }
        }
        getRateLimitStatus(modelId) {
            const bucket = this.buckets.get(modelId);
            const queue = this.queues.get(modelId) || [];
            return {
                tokens: bucket?.tokens ?? 0,
                queueLength: queue.length,
                quotaRemaining: bucket?.quota?.remaining,
                quotaResetTime: bucket?.quota?.resetTime
            };
        }
        logConfigUpdate(modelId) {
            const config = this.configs.get(modelId);
            const timestamp = new Date().toISOString();
            this.outputChannel.appendLine(`[${timestamp}] Updated rate limit config for model ${modelId}:`);
            this.outputChannel.appendLine(JSON.stringify(config, null, 2));
        }
        logQueueUpdate(modelId, queueLength) {
            const timestamp = new Date().toISOString();
            this.outputChannel.appendLine(`[${timestamp}] Queue update for model ${modelId}: ${queueLength} requests waiting`);
        }
        handleError(message, error) {
            this.logger.error('[ModelRateLimiter]', message, error);
            this.emit('error', error);
            this.outputChannel.appendLine(`\nError: ${message}`);
            this.outputChannel.appendLine(error.stack || error.message);
        }
        dispose() {
            clearInterval(this.cleanupInterval);
            // Reject all queued requests
            for (const [modelId, queue] of this.queues.entries()) {
                queue.forEach(request => {
                    clearTimeout(request.timeoutId);
                    request.reject(new Error('Rate limiter disposed'));
                });
                queue.length = 0;
            }
            this.queues.clear();
            this.buckets.clear();
            this.configs.clear();
            this.outputChannel.dispose();
            this.removeAllListeners();
        }
    };
    return ModelRateLimiter = _classThis;
})();
exports.ModelRateLimiter = ModelRateLimiter;
//# sourceMappingURL=ModelRateLimiter.js.map