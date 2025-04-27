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
Object.defineProperty(exports, "__esModule", { value: true });
exports.LLMCacheManager = void 0;
var events_1 = require("events");
/**
 * Default cache configuration
 */
var DEFAULT_CACHE_CONFIG = {
    modelInfoTTL: 5 * 60 * 1000, // 5 minutes
    healthCheckTTL: 30 * 1000, // 30 seconds
    responseCacheTTL: 60 * 60 * 1000, // 1 hour
    maxCacheSize: 1000
};
/**
 * Manages caching for LLM-related data
 */
var LLMCacheManager = /** @class */ (function (_super) {
    __extends(LLMCacheManager, _super);
    function LLMCacheManager(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.modelInfoCache = new Map();
        _this.healthCheckCache = new Map();
        _this.responseCache = new Map();
        _this.config = __assign(__assign({}, DEFAULT_CACHE_CONFIG), config);
        _this.startCleanupInterval();
        return _this;
    }
    LLMCacheManager.getInstance = function (config) {
        if (!this.instance) {
            this.instance = new LLMCacheManager(config);
        }
        return this.instance;
    };
    /**
     * Cache model information
     */
    LLMCacheManager.prototype.cacheModelInfo = function (providerId, modelInfo) {
        this.modelInfoCache.set(this.getModelKey(providerId), {
            data: modelInfo,
            expiry: Date.now() + this.config.modelInfoTTL
        });
        this.emit('modelInfoCached', { providerId: providerId, modelInfo: modelInfo });
    };
    /**
     * Get cached model information
     */
    LLMCacheManager.prototype.getModelInfo = function (providerId) {
        var entry = this.modelInfoCache.get(this.getModelKey(providerId));
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    };
    /**
     * Cache health check response
     */
    LLMCacheManager.prototype.cacheHealthCheck = function (providerId, response) {
        this.healthCheckCache.set(this.getHealthKey(providerId), {
            data: response,
            expiry: Date.now() + this.config.healthCheckTTL
        });
        this.emit('healthCheckCached', { providerId: providerId, response: response });
    };
    /**
     * Get cached health check response
     */
    LLMCacheManager.prototype.getHealthCheck = function (providerId) {
        var entry = this.healthCheckCache.get(this.getHealthKey(providerId));
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    };
    /**
     * Cache a response
     */
    LLMCacheManager.prototype.cacheResponse = function (key, response, ttl) {
        this.ensureCacheSize();
        this.responseCache.set(key, {
            data: response,
            expiry: Date.now() + (ttl || this.config.responseCacheTTL)
        });
        this.emit('responseCached', { key: key, response: response });
    };
    /**
     * Get a cached response
     */
    LLMCacheManager.prototype.getResponse = function (key) {
        var entry = this.responseCache.get(key);
        if (entry && entry.expiry > Date.now()) {
            return entry.data;
        }
        return undefined;
    };
    /**
     * Clear cache for a provider
     */
    LLMCacheManager.prototype.clearProviderCache = function (providerId) {
        var modelKey = this.getModelKey(providerId);
        var healthKey = this.getHealthKey(providerId);
        this.modelInfoCache.delete(modelKey);
        this.healthCheckCache.delete(healthKey);
        // Clear provider-specific responses
        var prefix = "".concat(providerId, ":");
        for (var _i = 0, _a = this.responseCache.keys(); _i < _a.length; _i++) {
            var key = _a[_i];
            if (key.startsWith(prefix)) {
                this.responseCache.delete(key);
            }
        }
        this.emit('providerCacheCleared', providerId);
    };
    /**
     * Clear all caches
     */
    LLMCacheManager.prototype.clearAll = function () {
        this.modelInfoCache.clear();
        this.healthCheckCache.clear();
        this.responseCache.clear();
        this.emit('cacheCleared');
    };
    /**
     * Get cache statistics
     */
    LLMCacheManager.prototype.getStats = function () {
        return {
            modelInfoCount: this.modelInfoCache.size,
            healthCheckCount: this.healthCheckCache.size,
            responseCount: this.responseCache.size,
            config: __assign({}, this.config)
        };
    };
    LLMCacheManager.prototype.getModelKey = function (providerId) {
        return "model:".concat(providerId);
    };
    LLMCacheManager.prototype.getHealthKey = function (providerId) {
        return "health:".concat(providerId);
    };
    LLMCacheManager.prototype.ensureCacheSize = function () {
        var _this = this;
        if (this.responseCache.size >= this.config.maxCacheSize) {
            // Remove oldest entries
            var entries = Array.from(this.responseCache.entries());
            entries.sort(function (a, b) { return a[1].expiry - b[1].expiry; });
            var toRemove = entries.slice(0, Math.floor(this.config.maxCacheSize * 0.2));
            toRemove.forEach(function (_a) {
                var key = _a[0];
                return _this.responseCache.delete(key);
            });
        }
    };
    LLMCacheManager.prototype.startCleanupInterval = function () {
        var _this = this;
        setInterval(function () {
            var now = Date.now();
            // Clean up expired entries
            for (var _i = 0, _a = _this.modelInfoCache.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], key = _b[0], entry = _b[1];
                if (entry.expiry <= now) {
                    _this.modelInfoCache.delete(key);
                }
            }
            for (var _c = 0, _d = _this.healthCheckCache.entries(); _c < _d.length; _c++) {
                var _e = _d[_c], key = _e[0], entry = _e[1];
                if (entry.expiry <= now) {
                    _this.healthCheckCache.delete(key);
                }
            }
            for (var _f = 0, _g = _this.responseCache.entries(); _f < _g.length; _f++) {
                var _h = _g[_f], key = _h[0], entry = _h[1];
                if (entry.expiry <= now) {
                    _this.responseCache.delete(key);
                }
            }
        }, 60000); // Clean up every minute
    };
    LLMCacheManager.prototype.dispose = function () {
        this.clearAll();
        this.removeAllListeners();
    };
    return LLMCacheManager;
}(events_1.EventEmitter));
exports.LLMCacheManager = LLMCacheManager;
