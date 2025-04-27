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
exports.ConnectionPoolManager = void 0;
var events_1 = require("events");
var interfaces_1 = require("./interfaces");
var errors_1 = require("./errors");
var ConnectionMetricsTracker_1 = require("./ConnectionMetricsTracker");
/**
 * Default pool configuration
 */
var DEFAULT_POOL_CONFIG = {
    maxSize: 5,
    minSize: 1,
    acquireTimeout: 30000,
    idleTimeout: 60000,
    maxWaitingClients: 10
};
/**
 * Manages a pool of LLM connections
 */
var ConnectionPoolManager = /** @class */ (function (_super) {
    __extends(ConnectionPoolManager, _super);
    function ConnectionPoolManager(config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.pool = new Map();
        _this.inUse = new Map();
        _this.waiting = new Map();
        _this.config = __assign(__assign({}, DEFAULT_POOL_CONFIG), config);
        _this.metricsTracker = new ConnectionMetricsTracker_1.ConnectionMetricsTracker();
        return _this;
    }
    ConnectionPoolManager.getInstance = function (config) {
        if (!this.instance) {
            this.instance = new ConnectionPoolManager(config);
        }
        return this.instance;
    };
    /**
     * Acquire a connection from the pool
     */
    ConnectionPoolManager.prototype.acquire = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var available, inUse, connection, connection;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        available = this.pool.get(providerId) || [];
                        inUse = this.getOrCreateInUseSet(providerId);
                        // Check for available connection
                        if (available.length > 0) {
                            connection = available.pop();
                            inUse.add(connection);
                            return [2 /*return*/, connection];
                        }
                        if (!(inUse.size < this.config.maxSize)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.createConnection(providerId)];
                    case 1:
                        connection = _a.sent();
                        inUse.add(connection);
                        return [2 /*return*/, connection];
                    case 2: 
                    // Wait for a connection if possible
                    return [2 /*return*/, this.waitForConnection(providerId)];
                }
            });
        });
    };
    /**
     * Release a connection back to the pool
     */
    ConnectionPoolManager.prototype.release = function (providerId, connection) {
        var inUse = this.inUse.get(providerId);
        if (!(inUse === null || inUse === void 0 ? void 0 : inUse.has(connection))) {
            return;
        }
        inUse.delete(connection);
        // Check waiting clients first
        var waiting = this.waiting.get(providerId) || [];
        if (waiting.length > 0) {
            var next = waiting.shift();
            clearTimeout(next.timeout);
            inUse.add(connection);
            next.resolve(connection);
            return;
        }
        // Add to available pool or destroy if above minSize
        var available = this.getOrCreatePool(providerId);
        if (available.length < this.config.minSize) {
            available.push(connection);
        }
        else {
            this.destroyConnection(connection).catch(console.error);
        }
    };
    /**
     * Clear all connections for a provider
     */
    ConnectionPoolManager.prototype.clear = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            var available, inUse, waiting;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        available = this.pool.get(providerId) || [];
                        inUse = this.inUse.get(providerId) || new Set();
                        waiting = this.waiting.get(providerId) || [];
                        // Reject waiting clients
                        waiting.forEach(function (_a) {
                            var reject = _a.reject, timeout = _a.timeout;
                            clearTimeout(timeout);
                            reject(new Error('Pool cleared'));
                        });
                        this.waiting.delete(providerId);
                        // Destroy all connections
                        return [4 /*yield*/, Promise.all(__spreadArray(__spreadArray([], available.map(function (conn) { return _this.destroyConnection(conn); }), true), __spreadArray([], inUse, true).map(function (conn) { return _this.destroyConnection(conn); }), true))];
                    case 1:
                        // Destroy all connections
                        _a.sent();
                        this.pool.delete(providerId);
                        this.inUse.delete(providerId);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get pool statistics
     */
    ConnectionPoolManager.prototype.getStats = function (providerId) {
        var _a, _b, _c;
        return {
            available: ((_a = this.pool.get(providerId)) === null || _a === void 0 ? void 0 : _a.length) || 0,
            inUse: ((_b = this.inUse.get(providerId)) === null || _b === void 0 ? void 0 : _b.size) || 0,
            waiting: ((_c = this.waiting.get(providerId)) === null || _c === void 0 ? void 0 : _c.length) || 0,
            metrics: this.metricsTracker.getMetrics()
        };
    };
    ConnectionPoolManager.prototype.getOrCreatePool = function (providerId) {
        if (!this.pool.has(providerId)) {
            this.pool.set(providerId, []);
        }
        return this.pool.get(providerId);
    };
    ConnectionPoolManager.prototype.getOrCreateInUseSet = function (providerId) {
        if (!this.inUse.has(providerId)) {
            this.inUse.set(providerId, new Set());
        }
        return this.inUse.get(providerId);
    };
    ConnectionPoolManager.prototype.createConnection = function (providerId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    // This would need to be implemented based on how connections are created
                    throw new Error('Connection creation not implemented');
                }
                catch (error) {
                    this.metricsTracker.recordRequestFailure(error instanceof Error ? error : new Error(String(error)));
                    throw new errors_1.LLMConnectionError(interfaces_1.ConnectionErrorCode.CONNECTION_FAILED, 'Failed to create connection', error instanceof Error ? error : undefined);
                }
                return [2 /*return*/];
            });
        });
    };
    ConnectionPoolManager.prototype.destroyConnection = function (connection) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, connection.disconnect()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        console.error('Error destroying connection:', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ConnectionPoolManager.prototype.waitForConnection = function (providerId) {
        var _this = this;
        var waiting = this.waiting.get(providerId) || [];
        if (waiting.length >= this.config.maxWaitingClients) {
            throw new errors_1.LLMConnectionError(interfaces_1.ConnectionErrorCode.CONNECTION_FAILED, 'Too many waiting clients');
        }
        if (!this.waiting.has(providerId)) {
            this.waiting.set(providerId, []);
        }
        return new Promise(function (resolve, reject) {
            var timeout = setTimeout(function () {
                var index = waiting.findIndex(function (w) { return w.timeout === timeout; });
                if (index !== -1) {
                    waiting.splice(index, 1);
                }
                reject(new errors_1.LLMConnectionError(interfaces_1.ConnectionErrorCode.TIMEOUT, 'Connection acquisition timeout'));
            }, _this.config.acquireTimeout);
            waiting.push({ resolve: resolve, reject: reject, timeout: timeout });
        });
    };
    ConnectionPoolManager.prototype.dispose = function () {
        var _this = this;
        // Clear all pools
        Promise.all(Array.from(this.pool.keys()).map(function (id) { return _this.clear(id); })).catch(console.error);
        this.removeAllListeners();
    };
    return ConnectionPoolManager;
}(events_1.EventEmitter));
exports.ConnectionPoolManager = ConnectionPoolManager;
