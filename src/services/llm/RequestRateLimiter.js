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
exports.RequestRateLimiter = void 0;
var events_1 = require("events");
/**
 * Default rate limit configuration
 */
var DEFAULT_RATE_LIMIT_CONFIG = {
    requestsPerSecond: 10,
    burstSize: 20,
    maxQueueSize: 100
};
/**
 * Manages request rate limiting for LLM providers
 */
var RequestRateLimiter = /** @class */ (function (_super) {
    __extends(RequestRateLimiter, _super);
    function RequestRateLimiter() {
        var _this = _super.call(this) || this;
        _this.buckets = new Map();
        _this.queues = new Map();
        _this.configs = new Map();
        return _this;
    }
    RequestRateLimiter.getInstance = function () {
        if (!this.instance) {
            this.instance = new RequestRateLimiter();
        }
        return this.instance;
    };
    /**
     * Configure rate limiting for a provider
     */
    RequestRateLimiter.prototype.configureProvider = function (providerId, config) {
        this.configs.set(providerId, __assign(__assign({}, DEFAULT_RATE_LIMIT_CONFIG), config));
    };
    /**
     * Acquire permission to make a request
     */
    RequestRateLimiter.prototype.acquireToken = function (providerId_1) {
        return __awaiter(this, arguments, void 0, function (providerId, timeout) {
            var config, bucket;
            if (timeout === void 0) { timeout = 5000; }
            return __generator(this, function (_a) {
                config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
                bucket = this.getOrCreateBucket(providerId, config);
                // Try to get a token
                if (this.tryAcquireToken(bucket, config)) {
                    return [2 /*return*/];
                }
                // If no tokens available, queue the request
                return [2 /*return*/, this.queueRequest(providerId, timeout)];
            });
        });
    };
    /**
     * Release tokens back to the bucket (for error cases)
     */
    RequestRateLimiter.prototype.releaseToken = function (providerId) {
        var bucket = this.buckets.get(providerId);
        var config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
        if (bucket && bucket.tokens < config.burstSize) {
            bucket.tokens++;
            this.processQueue(providerId);
        }
    };
    /**
     * Get current rate limit status
     */
    RequestRateLimiter.prototype.getStatus = function (providerId) {
        var _a;
        var bucket = this.buckets.get(providerId);
        var queue = this.queues.get(providerId) || [];
        var config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
        return {
            availableTokens: (_a = bucket === null || bucket === void 0 ? void 0 : bucket.tokens) !== null && _a !== void 0 ? _a : config.burstSize,
            queueLength: queue.length,
            config: __assign({}, config)
        };
    };
    RequestRateLimiter.prototype.getOrCreateBucket = function (providerId, config) {
        var bucket = this.buckets.get(providerId);
        if (!bucket) {
            bucket = {
                tokens: config.burstSize,
                lastRefill: Date.now()
            };
            this.buckets.set(providerId, bucket);
            return bucket;
        }
        // Refill tokens based on elapsed time
        var now = Date.now();
        var elapsedMs = now - bucket.lastRefill;
        var newTokens = (elapsedMs / 1000) * config.requestsPerSecond;
        bucket.tokens = Math.min(config.burstSize, bucket.tokens + newTokens);
        bucket.lastRefill = now;
        return bucket;
    };
    RequestRateLimiter.prototype.tryAcquireToken = function (bucket, config) {
        this.getOrCreateBucket(bucket.lastRefill.toString(), config); // Refill tokens
        if (bucket.tokens >= 1) {
            bucket.tokens--;
            return true;
        }
        return false;
    };
    RequestRateLimiter.prototype.queueRequest = function (providerId, timeout) {
        var queue = this.queues.get(providerId) || [];
        var config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
        if (queue.length >= config.maxQueueSize) {
            throw new Error('Rate limit queue full');
        }
        if (!this.queues.has(providerId)) {
            this.queues.set(providerId, []);
        }
        return new Promise(function (resolve, reject) {
            var timeoutId = setTimeout(function () {
                var index = queue.findIndex(function (r) { return r.timeout === timeoutId; });
                if (index !== -1) {
                    queue.splice(index, 1);
                }
                reject(new Error('Rate limit timeout'));
            }, timeout);
            queue.push({ resolve: resolve, reject: reject, timeout: timeoutId });
        });
    };
    RequestRateLimiter.prototype.processQueue = function (providerId) {
        var queue = this.queues.get(providerId) || [];
        var bucket = this.buckets.get(providerId);
        var config = this.configs.get(providerId) || DEFAULT_RATE_LIMIT_CONFIG;
        while (queue.length > 0 && bucket && bucket.tokens >= 1) {
            var request = queue.shift();
            if (request) {
                clearTimeout(request.timeout);
                bucket.tokens--;
                request.resolve();
            }
        }
    };
    /**
     * Clear rate limiting state for a provider
     */
    RequestRateLimiter.prototype.clearProvider = function (providerId) {
        var queue = this.queues.get(providerId) || [];
        // Reject all queued requests
        queue.forEach(function (request) {
            clearTimeout(request.timeout);
            request.reject(new Error('Rate limiter cleared'));
        });
        this.queues.delete(providerId);
        this.buckets.delete(providerId);
        this.configs.delete(providerId);
    };
    RequestRateLimiter.prototype.dispose = function () {
        // Clear all providers
        for (var _i = 0, _a = this.queues.keys(); _i < _a.length; _i++) {
            var providerId = _a[_i];
            this.clearProvider(providerId);
        }
        this.removeAllListeners();
    };
    return RequestRateLimiter;
}(events_1.EventEmitter));
exports.RequestRateLimiter = RequestRateLimiter;
