"use strict";
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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CachingService = void 0;
var logger_1 = require("../utils/logger");
/**
 * CachingService provides a general-purpose caching mechanism for operations
 * that are expensive to compute but rarely change
 */
var CachingService = /** @class */ (function () {
    function CachingService() {
        this.cache = new Map();
        this.maxCacheSize = 100; // Default max items to store
        this.cleanupIntervalId = null;
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalMemoryBytes: 0
        };
        this.CLEANUP_THRESHOLD = 0.1; // Only cleanup when 10% over limit
        this.logger = logger_1.Logger.getInstance();
        // Start periodic cleanup every 5 minutes
        this.startCleanupInterval(5 * 60 * 1000);
    }
    CachingService.getInstance = function () {
        if (!CachingService.instance) {
            CachingService.instance = new CachingService();
        }
        return CachingService.instance;
    };
    /**
     * Set the maximum number of items to cache
     */
    CachingService.prototype.setMaxCacheSize = function (size) {
        this.maxCacheSize = size;
        this.enforceMaxSize();
    };
    /**
     * Get a value from cache or compute it if not available
     */
    CachingService.prototype.getOrCompute = function (key, computeFunc, ttlMs) {
        return __awaiter(this, void 0, void 0, function () {
            var cachedValue, startTime, value, duration, expiresAt, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        cachedValue = this.get(key);
                        if (cachedValue !== undefined) {
                            return [2 /*return*/, cachedValue];
                        }
                        startTime = performance.now();
                        return [4 /*yield*/, computeFunc()];
                    case 1:
                        value = _a.sent();
                        duration = performance.now() - startTime;
                        // Log slow computations
                        if (duration > 1000) {
                            this.logger.warn("Slow cache computation for key ".concat(key, ": ").concat(Math.round(duration), "ms"));
                        }
                        expiresAt = ttlMs ? Date.now() + ttlMs : null;
                        this.cache.set(key, {
                            value: value,
                            createdAt: Date.now(),
                            expiresAt: expiresAt,
                            accessCount: 0,
                            lastAccessed: Date.now()
                        });
                        this.enforceMaxSize();
                        return [2 /*return*/, value];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error("Cache computation failed for key ".concat(key, ": ").concat(error_1));
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Manually set a cache value
     */
    CachingService.prototype.set = function (key, value, ttlMs) {
        var now = Date.now();
        var expiresAt = ttlMs ? now + ttlMs : null;
        // Estimate memory size
        var estimatedSize = this.estimateObjectSize(value);
        this.cacheStats.totalMemoryBytes += estimatedSize;
        this.cache.set(key, {
            value: value,
            createdAt: now,
            lastAccessed: now,
            expiresAt: expiresAt,
            sizeBytes: estimatedSize
        });
        this.updateLRUOrder(key);
        this.enforceMaxSize();
    };
    /**
     * Check if a key exists in the cache and hasn't expired
     */
    CachingService.prototype.has = function (key) {
        var cachedItem = this.cache.get(key);
        if (!cachedItem) {
            return false;
        }
        var now = Date.now();
        return cachedItem.expiresAt === null || cachedItem.expiresAt > now;
    };
    /**
     * Get a value from the cache (returns undefined if not found or expired)
     */
    CachingService.prototype.get = function (key) {
        var cachedItem = this.cache.get(key);
        if (!cachedItem) {
            this.cacheStats.misses++;
            return undefined;
        }
        var now = Date.now();
        if (cachedItem.expiresAt !== null && cachedItem.expiresAt <= now) {
            this.cache.delete(key);
            this.cacheStats.evictions++;
            return undefined;
        }
        this.cacheStats.hits++;
        cachedItem.accessCount = (cachedItem.accessCount || 0) + 1;
        cachedItem.lastAccessed = now;
        return cachedItem.value;
    };
    /**
     * Remove a specific item from the cache
     */
    CachingService.prototype.invalidate = function (key) {
        var result = this.cache.delete(key);
        if (result) {
            var lruIndex = this.lruList.indexOf(key);
            if (lruIndex > -1) {
                this.lruList.splice(lruIndex, 1);
            }
        }
        return result;
    };
    /**
     * Clear all items from the cache
     */
    CachingService.prototype.clearAll = function () {
        this.cache.clear();
        this.lruList = [];
        this.logger.log('Cache cleared');
    };
    /**
     * Start the cleanup interval timer
     */
    CachingService.prototype.startCleanupInterval = function (intervalMs) {
        var _this = this;
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
        }
        this.cleanupIntervalId = setInterval(function () {
            _this.removeExpiredItems();
        }, intervalMs);
    };
    /**
     * Remove all expired items from the cache
     */
    CachingService.prototype.removeExpiredItems = function () {
        var now = Date.now();
        var expiredCount = 0;
        for (var _i = 0, _a = __spreadArray([], this.cache.keys(), true); _i < _a.length; _i++) {
            var key = _a[_i];
            var item = this.cache.get(key);
            if ((item === null || item === void 0 ? void 0 : item.expiresAt) !== null && (item === null || item === void 0 ? void 0 : item.expiresAt) <= now) {
                this.cache.delete(key);
                var lruIndex = this.lruList.indexOf(key);
                if (lruIndex > -1) {
                    this.lruList.splice(lruIndex, 1);
                }
                expiredCount++;
                this.cacheStats.evictions++;
            }
        }
        if (expiredCount > 0) {
            this.logger.log("Removed ".concat(expiredCount, " expired items from cache"));
        }
    };
    /**
     * Ensure the cache doesn't exceed the maximum size
     */
    CachingService.prototype.enforceMaxSize = function () {
        if (this.cache.size <= this.maxCacheSize) {
            return;
        }
        // Use LRU (Least Recently Used) + frequency based eviction
        var entries = Array.from(this.cache.entries())
            .sort(function (a, b) {
            // Combine recency and frequency for scoring
            var scoreA = (a[1].lastAccessed || 0) + (a[1].accessCount || 0) * 1000;
            var scoreB = (b[1].lastAccessed || 0) + (b[1].accessCount || 0) * 1000;
            return scoreA - scoreB;
        });
        var entriesToDelete = this.cache.size - this.maxCacheSize;
        for (var i = 0; i < entriesToDelete; i++) {
            this.cache.delete(entries[i][0]);
        }
        this.logger.debug("Cache evicted ".concat(entriesToDelete, " items using LRU+frequency strategy"));
    };
    CachingService.prototype.updateLRUOrder = function (key) {
        var index = this.lruList.indexOf(key);
        if (index > -1) {
            this.lruList.splice(index, 1);
        }
        this.lruList.unshift(key);
    };
    /**
     * Dispose the service and clear any timers
     */
    CachingService.prototype.dispose = function () {
        if (this.cleanupIntervalId) {
            clearInterval(this.cleanupIntervalId);
            this.cleanupIntervalId = null;
        }
        this.cache.clear();
        this.lruList = [];
    };
    /**
     * Get cache metrics
     */
    CachingService.prototype.getMetrics = function () {
        return __assign({}, this.cacheStats);
    };
    /**
     * Get cache statistics
     */
    CachingService.prototype.getCacheStats = function () {
        return __assign(__assign({}, this.cacheStats), { size: this.cache.size });
    };
    CachingService.prototype.estimateObjectSize = function (obj) {
        var seen = new WeakSet();
        var estimate = function (value) {
            if (value === null || value === undefined) {
                return 0;
            }
            if (typeof value !== 'object') {
                return 8;
            } // Primitive size approximation
            if (seen.has(value)) {
                return 0;
            } // Handle circular references
            seen.add(value);
            var size = 0;
            if (Array.isArray(value)) {
                size = value.reduce(function (acc, item) { return acc + estimate(item); }, 0);
            }
            else {
                for (var key in value) {
                    if (Object.prototype.hasOwnProperty.call(value, key)) {
                        size += key.length * 2; // UTF-16 characters
                        size += estimate(value[key]);
                    }
                }
            }
            return size;
        };
        return estimate(obj);
    };
    CachingService.prototype.resetStats = function () {
        this.cacheStats = {
            hits: 0,
            misses: 0,
            evictions: 0,
            totalMemoryBytes: 0
        };
    };
    return CachingService;
}());
exports.CachingService = CachingService;
