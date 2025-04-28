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
exports.ModelRateLimiter = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const logging_1 = require("../../common/logging");
let ModelRateLimiter = class ModelRateLimiter extends events_1.EventEmitter {
    constructor(logger) {
        super();
        this.logger = logger;
        this.buckets = new Map();
        this.queues = new Map();
        this.configs = new Map();
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
            queue.push({ id: requestId, timestamp: new Date(), resolve, reject, timeoutId });
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
exports.ModelRateLimiter = ModelRateLimiter;
exports.ModelRateLimiter = ModelRateLimiter = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
    __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object])
], ModelRateLimiter);
//# sourceMappingURL=ModelRateLimiter.js.map