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
exports.BaseConnectionManager = void 0;
var events_1 = require("events");
var LLMProviderRegistryService_1 = require("./services/LLMProviderRegistryService");
var types_1 = require("./types");
var DEFAULT_HEALTH_CONFIG = {
    checkIntervalMs: 30000,
    timeoutMs: 5000,
    unhealthyThreshold: 3,
    healthyThreshold: 2,
    maxConsecutiveFailures: 5
};
/**
 * Base class for LLM connection management
 * Provides common functionality for connection handling, health monitoring, and error management
 */
var BaseConnectionManager = /** @class */ (function (_super) {
    __extends(BaseConnectionManager, _super);
    function BaseConnectionManager(config) {
        var _this = _super.call(this) || this;
        _this.activeProvider = null;
        _this.currentStatus = {
            isConnected: false,
            isAvailable: false,
            error: ''
        };
        _this.healthCheckInterval = null;
        _this.retryConfig = {
            maxAttempts: 3,
            baseDelay: 1000,
            maxDelay: 30000,
            backoffFactor: 2,
            currentAttempt: 0,
            timeout: 10000
        };
        _this.providerRegistry = new LLMProviderRegistryService_1.LLMProviderRegistryService();
        _this.retryConfig = __assign(__assign({}, _this.retryConfig), config);
        _this.healthConfig = __assign(__assign({}, DEFAULT_HEALTH_CONFIG), config);
        _this.setupEventHandlers();
        return _this;
    }
    BaseConnectionManager.prototype.setupEventHandlers = function () {
        this.providerRegistry.on('providerStatusChanged', this.handleProviderStatusChange.bind(this));
    };
    BaseConnectionManager.prototype.registerProvider = function (name, provider) {
        this.providerRegistry.registerProvider(name, provider);
    };
    BaseConnectionManager.prototype.configureProvider = function (name, options) {
        return __awaiter(this, void 0, void 0, function () {
            var provider, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        return [4 /*yield*/, this.providerRegistry.configureProvider(name, options)];
                    case 1:
                        provider = _a.sent();
                        this.activeProvider = provider;
                        this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
                        return [3 /*break*/, 4];
                    case 2:
                        error_1 = _a.sent();
                        return [4 /*yield*/, this.handleConnectionError(error_1)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BaseConnectionManager.prototype.connect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _loop_1, this_1, state_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.retryConfig.currentAttempt = 0;
                        _loop_1 = function () {
                            var error_2, delay_1;
                            return __generator(this, function (_b) {
                                switch (_b.label) {
                                    case 0:
                                        _b.trys.push([0, 2, , 4]);
                                        return [4 /*yield*/, this_1.establishConnection()];
                                    case 1:
                                        _b.sent();
                                        this_1.startHealthChecks();
                                        this_1.emit(types_1.ConnectionEvent.Connected);
                                        return [2 /*return*/, { value: void 0 }];
                                    case 2:
                                        error_2 = _b.sent();
                                        this_1.retryConfig.currentAttempt++;
                                        if (this_1.retryConfig.currentAttempt === this_1.retryConfig.maxAttempts) {
                                            throw new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.ConnectionFailed, "Failed to connect after ".concat(this_1.retryConfig.maxAttempts, " attempts: ").concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                                        }
                                        delay_1 = Math.min(this_1.retryConfig.baseDelay * Math.pow(this_1.retryConfig.backoffFactor, this_1.retryConfig.currentAttempt), this_1.retryConfig.maxDelay);
                                        return [4 /*yield*/, new Promise(function (resolve) { return setTimeout(resolve, delay_1); })];
                                    case 3:
                                        _b.sent();
                                        return [3 /*break*/, 4];
                                    case 4: return [2 /*return*/];
                                }
                            });
                        };
                        this_1 = this;
                        _a.label = 1;
                    case 1:
                        if (!(this.retryConfig.currentAttempt < this.retryConfig.maxAttempts)) return [3 /*break*/, 3];
                        return [5 /*yield**/, _loop_1()];
                    case 2:
                        state_1 = _a.sent();
                        if (typeof state_1 === "object")
                            return [2 /*return*/, state_1.value];
                        return [3 /*break*/, 1];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    BaseConnectionManager.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.stopHealthChecks();
                        return [4 /*yield*/, this.terminateConnection()];
                    case 1:
                        _a.sent();
                        this.currentStatus = { isConnected: false, isAvailable: false, error: '' };
                        this.emit(types_1.ConnectionEvent.Disconnected);
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseConnectionManager.prototype.handleConnectionError = function (error) {
        return __awaiter(this, void 0, void 0, function () {
            var formattedError;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        formattedError = error instanceof Error ? error : new Error(String(error));
                        this.currentStatus = __assign(__assign({}, this.currentStatus), { isConnected: false, error: formattedError.message });
                        this.emit(types_1.ConnectionEvent.Error, formattedError);
                        this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
                        if (!this.shouldAttemptReconnect(error)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.reconnect()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/];
                }
            });
        });
    };
    BaseConnectionManager.prototype.startHealthChecks = function () {
        var _this = this;
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
        }
        this.healthCheckInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var health, error_3;
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _b.trys.push([0, 5, , 7]);
                        return [4 /*yield*/, this.performHealthCheck()];
                    case 1:
                        health = _b.sent();
                        if (!(health.status === 'error')) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.handleHealthCheckFailure(health)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        // Reset retry counter on successful health check
                        this.retryConfig.currentAttempt = 0;
                        // Update model info if available
                        if ((_a = health.models) === null || _a === void 0 ? void 0 : _a.length) {
                            this.currentStatus.metadata = __assign(__assign({}, this.currentStatus.metadata), { modelInfo: health.models[0] });
                        }
                        _b.label = 4;
                    case 4: return [3 /*break*/, 7];
                    case 5:
                        error_3 = _b.sent();
                        return [4 /*yield*/, this.handleConnectionError(error_3)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        }); }, this.healthConfig.checkIntervalMs);
    };
    BaseConnectionManager.prototype.stopHealthChecks = function () {
        if (this.healthCheckInterval) {
            clearInterval(this.healthCheckInterval);
            this.healthCheckInterval = null;
        }
    };
    BaseConnectionManager.prototype.handleHealthCheckFailure = function (health) {
        return __awaiter(this, void 0, void 0, function () {
            var error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        error = new types_1.LLMConnectionError(types_1.LLMConnectionErrorCode.HealthCheckFailed, health.message || 'Health check failed');
                        return [4 /*yield*/, this.handleConnectionError(error)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseConnectionManager.prototype.handleProviderStatusChange = function (data) {
        var _a;
        if (((_a = this.activeProvider) === null || _a === void 0 ? void 0 : _a.name) === data.name) {
            this.currentStatus = data.status;
            this.emit(types_1.ConnectionEvent.StateChanged, this.createConnectionEventData());
        }
    };
    BaseConnectionManager.prototype.reconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            var error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 4]);
                        this.emit(types_1.ConnectionEvent.Reconnecting);
                        return [4 /*yield*/, this.connect()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        error_4 = _a.sent();
                        console.error('Reconnection failed:', error_4);
                        return [4 /*yield*/, this.handleConnectionError(error_4)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BaseConnectionManager.prototype.shouldAttemptReconnect = function (error) {
        if (this.retryConfig.currentAttempt >= this.retryConfig.maxAttempts) {
            return false;
        }
        // Network-related errors are generally retryable
        if (error instanceof Error) {
            var networkErrors = [
                'ECONNREFUSED',
                'ECONNRESET',
                'ETIMEDOUT',
                'ENOTFOUND',
                'NETWORK_ERROR',
                'DISCONNECT'
            ];
            return networkErrors.some(function (code) { return error.message.includes(code); });
        }
        return false;
    };
    BaseConnectionManager.prototype.createConnectionEventData = function () {
        var _a;
        return {
            state: this.currentStatus.isConnected ? 'connected' : 'disconnected',
            timestamp: new Date(),
            error: this.currentStatus.error ? new Error(this.currentStatus.error) : undefined,
            modelInfo: (_a = this.currentStatus.metadata) === null || _a === void 0 ? void 0 : _a.modelInfo
        };
    };
    BaseConnectionManager.prototype.getStatus = function () {
        return this.currentStatus;
    };
    BaseConnectionManager.prototype.dispose = function () {
        this.stopHealthChecks();
        this.disconnect().catch(console.error);
        this.removeAllListeners();
    };
    return BaseConnectionManager;
}(events_1.EventEmitter));
exports.BaseConnectionManager = BaseConnectionManager;
