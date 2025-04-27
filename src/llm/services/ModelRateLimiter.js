"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelRateLimiter = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var logging_1 = require("../../common/logging");
var ModelRateLimiter = /** @class */ (function (_super) {
    __extends(ModelRateLimiter, _super);
    function ModelRateLimiter(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.buckets = new Map();
        _this.queues = new Map();
        _this.configs = new Map();
        _this.outputChannel = vscode.window.createOutputChannel('Model Rate Limiter');
        _this.cleanupInterval = setInterval(function () { return _this.cleanupStaleRequests(); }, 60000);
        return _this;
    }
    ModelRateLimiter.prototype.configureModel = function (modelId, config) {
        return __awaiter(this, void 0, void 0, function () {
            var defaultConfig;
            return __generator(this, function (_a) {
                try {
                    defaultConfig = {
                        requestsPerSecond: 10,
                        burstLimit: 20,
                        maxQueueSize: 100,
                        timeWindowMs: 3600000 // 1 hour
                    };
                    this.configs.set(modelId, __assign(__assign({}, defaultConfig), config));
                    this.logConfigUpdate(modelId);
                }
                catch (error) {
                    this.handleError("Failed to configure model ".concat(modelId), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelRateLimiter.prototype.acquireToken = function (modelId_1) {
        return __awaiter(this, arguments, void 0, function (modelId, timeout) {
            var config, bucket;
            if (timeout === void 0) { timeout = 5000; }
            return __generator(this, function (_a) {
                try {
                    config = this.configs.get(modelId);
                    if (!config) {
                        throw new Error("Model ".concat(modelId, " not configured for rate limiting"));
                    }
                    bucket = this.getOrCreateBucket(modelId, config);
                    if (this.checkAndUpdateQuota(bucket, config)) {
                        if (this.tryAcquireToken(bucket, config)) {
                            return [2 /*return*/];
                        }
                        return [2 /*return*/, this.enqueueRequest(modelId, timeout)];
                    }
                    throw new Error("Quota exceeded for model ".concat(modelId));
                }
                catch (error) {
                    this.handleError("Failed to acquire token for model ".concat(modelId), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelRateLimiter.prototype.getOrCreateBucket = function (modelId, config) {
        var bucket = this.buckets.get(modelId);
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
        var now = Date.now();
        var timePassed = (now - bucket.lastRefill) / 1000;
        var newTokens = timePassed * config.requestsPerSecond;
        bucket.tokens = Math.min(config.burstLimit, bucket.tokens + newTokens);
        bucket.lastRefill = now;
        return bucket;
    };
    ModelRateLimiter.prototype.tryAcquireToken = function (bucket, config) {
        if (bucket.tokens >= 1) {
            bucket.tokens--;
            return true;
        }
        return false;
    };
    ModelRateLimiter.prototype.checkAndUpdateQuota = function (bucket, config) {
        if (!bucket.quota || !config.quotaLimit) {
            return true;
        }
        var now = Date.now();
        if (now > bucket.quota.resetTime) {
            bucket.quota.remaining = config.quotaLimit;
            bucket.quota.resetTime = now + (config.timeWindowMs || 3600000);
        }
        if (bucket.quota.remaining > 0) {
            bucket.quota.remaining--;
            return true;
        }
        return false;
    };
    ModelRateLimiter.prototype.enqueueRequest = function (modelId, timeout) {
        return __awaiter(this, void 0, void 0, function () {
            var queue, config;
            var _this = this;
            return __generator(this, function (_a) {
                queue = this.queues.get(modelId) || [];
                config = this.configs.get(modelId);
                if (!config) {
                    throw new Error("Model ".concat(modelId, " not configured for rate limiting"));
                }
                if (queue.length >= config.maxQueueSize) {
                    throw new Error("Rate limit queue full for model ".concat(modelId));
                }
                if (!this.queues.has(modelId)) {
                    this.queues.set(modelId, []);
                }
                return [2 /*return*/, new Promise(function (resolve, reject) {
                        var requestId = "".concat(Date.now(), "-").concat(Math.random().toString(36).substr(2, 9));
                        var timeoutId = setTimeout(function () {
                            _this.removeRequest(modelId, requestId);
                            reject(new Error('Rate limit request timeout'));
                        }, timeout);
                        queue.push({ id: requestId, timestamp: new Date(), resolve: resolve, reject: reject, timeoutId: timeoutId });
                        _this.logQueueUpdate(modelId, queue.length);
                    })];
            });
        });
    };
    ModelRateLimiter.prototype.removeRequest = function (modelId, requestId) {
        var queue = this.queues.get(modelId);
        if (!queue)
            return;
        var index = queue.findIndex(function (r) { return r.id === requestId; });
        if (index !== -1) {
            clearTimeout(queue[index].timeoutId);
            queue.splice(index, 1);
        }
    };
    ModelRateLimiter.prototype.processQueue = function (modelId) {
        var queue = this.queues.get(modelId);
        var config = this.configs.get(modelId);
        if (!queue || !config)
            return;
        var bucket = this.getOrCreateBucket(modelId, config);
        while (queue.length > 0 && this.tryAcquireToken(bucket, config)) {
            var request = queue.shift();
            if (request) {
                clearTimeout(request.timeoutId);
                request.resolve();
            }
        }
        this.logQueueUpdate(modelId, queue.length);
    };
    ModelRateLimiter.prototype.cleanupStaleRequests = function () {
        var now = Date.now();
        var _loop_1 = function (modelId, queue) {
            var staleTimeout = 300000; // 5 minutes
            var filtered = queue.filter(function (request) {
                var isStale = (now - request.timestamp) > staleTimeout;
                if (isStale) {
                    clearTimeout(request.timeoutId);
                    request.reject(new Error('Request expired'));
                }
                return !isStale;
            });
            this_1.queues.set(modelId, filtered);
        };
        var this_1 = this;
        for (var _i = 0, _a = this.queues.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], modelId = _b[0], queue = _b[1];
            _loop_1(modelId, queue);
        }
    };
    ModelRateLimiter.prototype.getRateLimitStatus = function (modelId) {
        var _a, _b, _c;
        var bucket = this.buckets.get(modelId);
        var queue = this.queues.get(modelId) || [];
        return {
            tokens: (_a = bucket === null || bucket === void 0 ? void 0 : bucket.tokens) !== null && _a !== void 0 ? _a : 0,
            queueLength: queue.length,
            quotaRemaining: (_b = bucket === null || bucket === void 0 ? void 0 : bucket.quota) === null || _b === void 0 ? void 0 : _b.remaining,
            quotaResetTime: (_c = bucket === null || bucket === void 0 ? void 0 : bucket.quota) === null || _c === void 0 ? void 0 : _c.resetTime
        };
    };
    ModelRateLimiter.prototype.logConfigUpdate = function (modelId) {
        var config = this.configs.get(modelId);
        var timestamp = new Date().toISOString();
        this.outputChannel.appendLine("[".concat(timestamp, "] Updated rate limit config for model ").concat(modelId, ":"));
        this.outputChannel.appendLine(JSON.stringify(config, null, 2));
    };
    ModelRateLimiter.prototype.logQueueUpdate = function (modelId, queueLength) {
        var timestamp = new Date().toISOString();
        this.outputChannel.appendLine("[".concat(timestamp, "] Queue update for model ").concat(modelId, ": ").concat(queueLength, " requests waiting"));
    };
    ModelRateLimiter.prototype.handleError = function (message, error) {
        this.logger.error('[ModelRateLimiter]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    ModelRateLimiter.prototype.dispose = function () {
        clearInterval(this.cleanupInterval);
        // Reject all queued requests
        for (var _i = 0, _a = this.queues.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], modelId = _b[0], queue = _b[1];
            queue.forEach(function (request) {
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
    };
    var _a;
    ModelRateLimiter = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object])
    ], ModelRateLimiter);
    return ModelRateLimiter;
}(events_1.EventEmitter));
exports.ModelRateLimiter = ModelRateLimiter;
