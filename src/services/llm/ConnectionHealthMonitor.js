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
exports.ConnectionHealthMonitor = void 0;
var events_1 = require("events");
var ConnectionMetricsTracker_1 = require("./ConnectionMetricsTracker");
var ConnectionRetryHandler_1 = require("./ConnectionRetryHandler");
/**
 * Default health check configuration
 */
var DEFAULT_HEALTH_CONFIG = {
    checkIntervalMs: 30000, // 30 seconds
    timeoutMs: 5000,
    unhealthyThreshold: 3,
    healthyThreshold: 2,
    maxConsecutiveFailures: 5
};
/**
 * Monitors health of LLM connections
 */
var ConnectionHealthMonitor = /** @class */ (function (_super) {
    __extends(ConnectionHealthMonitor, _super);
    function ConnectionHealthMonitor() {
        var _this = _super.call(this) || this;
        _this.healthStates = new Map();
        _this.checkIntervals = new Map();
        _this.connectionManagers = new Map();
        _this.metricsTracker = new ConnectionMetricsTracker_1.ConnectionMetricsTracker();
        _this.retryHandler = ConnectionRetryHandler_1.ConnectionRetryHandler.getInstance();
        return _this;
    }
    ConnectionHealthMonitor.getInstance = function () {
        if (!this.instance) {
            this.instance = new ConnectionHealthMonitor();
        }
        return this.instance;
    };
    ConnectionHealthMonitor.prototype.registerConnectionManager = function (providerId, manager) {
        this.connectionManagers.set(providerId, manager);
        this.initializeHealth(providerId);
    };
    ConnectionHealthMonitor.prototype.initializeHealth = function (providerId) {
        if (!this.healthStates.has(providerId)) {
            this.healthStates.set(providerId, {
                status: types_1.ProviderStatus.UNKNOWN,
                lastCheck: 0,
                lastSuccess: 0,
                consecutiveSuccesses: 0,
                consecutiveFailures: 0,
                totalChecks: 0,
                error: undefined
            });
        }
    };
    ConnectionHealthMonitor.prototype.startMonitoring = function (providerId, healthCheck, config) {
        var _this = this;
        this.initializeHealthState(providerId);
        this.stopMonitoring(providerId);
        var interval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.performHealthCheck(providerId, healthCheck, config)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, config.checkIntervalMs);
        this.checkIntervals.set(providerId, interval);
        // Perform initial health check
        this.performHealthCheck(providerId, healthCheck, config);
    };
    ConnectionHealthMonitor.prototype.performHealthCheck = function (providerId, healthCheck, config) {
        return __awaiter(this, void 0, void 0, function () {
            var state, timeoutPromise, response, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        state = this.healthStates.get(providerId);
                        timeoutPromise = new Promise(function (_, reject) {
                            setTimeout(function () { return reject(new Error('Health check timeout')); }, config.timeoutMs);
                        });
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, Promise.race([healthCheck(), timeoutPromise])];
                    case 2:
                        response = _a.sent();
                        this.handleSuccessfulCheck(providerId, state, config);
                        this.emit('healthCheckSuccess', { providerId: providerId, response: response });
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        this.handleFailedCheck(providerId, state, config, error_1);
                        this.emit('healthCheckFailure', { providerId: providerId, error: error_1 });
                        return [3 /*break*/, 4];
                    case 4:
                        state.totalChecks++;
                        this.emit('healthStateChanged', { providerId: providerId, state: __assign({}, state) });
                        return [2 /*return*/];
                }
            });
        });
    };
    ConnectionHealthMonitor.prototype.handleSuccessfulCheck = function (providerId, state, config) {
        state.lastSuccess = Date.now();
        state.consecutiveFailures = 0;
        state.consecutiveSuccesses++;
        state.error = undefined;
        if (state.consecutiveSuccesses >= config.healthyThreshold) {
            state.status = types_1.ProviderStatus.HEALTHY;
        }
    };
    ConnectionHealthMonitor.prototype.handleFailedCheck = function (providerId, state, config, error) {
        state.consecutiveFailures++;
        state.consecutiveSuccesses = 0;
        state.error = error;
        if (state.consecutiveFailures >= config.unhealthyThreshold) {
            state.status = types_1.ProviderStatus.UNHEALTHY;
        }
    };
    ConnectionHealthMonitor.prototype.initializeHealthState = function (providerId) {
        if (!this.healthStates.has(providerId)) {
            this.healthStates.set(providerId, {
                status: types_1.ProviderStatus.UNKNOWN,
                lastCheck: 0,
                lastSuccess: 0,
                consecutiveFailures: 0,
                consecutiveSuccesses: 0,
                totalChecks: 0
            });
        }
    };
    ConnectionHealthMonitor.prototype.stopMonitoring = function (providerId) {
        var interval = this.checkIntervals.get(providerId);
        if (interval) {
            clearInterval(interval);
            this.checkIntervals.delete(providerId);
        }
    };
    ConnectionHealthMonitor.prototype.getProviderHealth = function (providerId) {
        return this.healthStates.get(providerId);
    };
    ConnectionHealthMonitor.prototype.isHealthy = function (providerId) {
        var health = this.healthStates.get(providerId);
        return (health === null || health === void 0 ? void 0 : health.status) === types_1.ProviderStatus.HEALTHY;
    };
    ConnectionHealthMonitor.prototype.dispose = function () {
        for (var _i = 0, _a = this.checkIntervals.values(); _i < _a.length; _i++) {
            var interval = _a[_i];
            clearInterval(interval);
        }
        this.checkIntervals.clear();
        this.healthStates.clear();
        this.connectionManagers.clear();
        this.removeAllListeners();
    };
    return ConnectionHealthMonitor;
}(events_1.EventEmitter));
exports.ConnectionHealthMonitor = ConnectionHealthMonitor;
