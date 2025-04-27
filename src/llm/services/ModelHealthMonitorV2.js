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
exports.ModelHealthMonitorV2 = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../utils/logger");
var events_1 = require("events");
/**
 * Service for monitoring model health
 */
var ModelHealthMonitorV2 = /** @class */ (function (_super) {
    __extends(ModelHealthMonitorV2, _super);
    function ModelHealthMonitorV2(logger, config) {
        if (config === void 0) { config = {}; }
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.config = config;
        _this.health = new Map();
        _this.monitoringInterval = null;
        _this.startTimes = new Map();
        _this.logger.info('ModelHealthMonitorV2 initialized');
        _this.startMonitoring();
        return _this;
    }
    /**
     * Start health monitoring at regular intervals
     */
    ModelHealthMonitorV2.prototype.startMonitoring = function () {
        var _this = this;
        var frequency = this.config.monitoringFrequency || 30000; // Default to 30 seconds
        if (this.monitoringInterval) {
            return;
        }
        this.monitoringInterval = setInterval(function () { return __awaiter(_this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.checkHealth()];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.logger.error('Error checking health', error_1);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        }); }, frequency);
        this.logger.info("Started health monitoring with frequency ".concat(frequency, "ms"));
    };
    /**
     * Check health of all registered models
     */
    ModelHealthMonitorV2.prototype.checkHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var modelIds, _i, modelIds_1, modelId, currentHealth, newHealth, statusChanged, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 5, , 6]);
                        modelIds = Array.from(this.health.keys());
                        _i = 0, modelIds_1 = modelIds;
                        _a.label = 1;
                    case 1:
                        if (!(_i < modelIds_1.length)) return [3 /*break*/, 4];
                        modelId = modelIds_1[_i];
                        currentHealth = this.health.get(modelId);
                        return [4 /*yield*/, this.simulateHealthCheck(modelId, currentHealth)];
                    case 2:
                        newHealth = _a.sent();
                        statusChanged = currentHealth.status !== newHealth.status;
                        // Update health
                        this.health.set(modelId, newHealth);
                        if (statusChanged) {
                            this.emit('healthStatusChanged', {
                                modelId: modelId,
                                previousStatus: currentHealth.status,
                                currentStatus: newHealth.status,
                                health: newHealth
                            });
                        }
                        this.emit('healthChecked', {
                            modelId: modelId,
                            health: newHealth
                        });
                        _a.label = 3;
                    case 3:
                        _i++;
                        return [3 /*break*/, 1];
                    case 4:
                        this.logger.debug("Checked health for ".concat(modelIds.length, " models"));
                        return [3 /*break*/, 6];
                    case 5:
                        error_2 = _a.sent();
                        this.logger.error('Error in health check cycle', error_2);
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Simulate a health check (for testing)
     */
    ModelHealthMonitorV2.prototype.simulateHealthCheck = function (modelId, currentHealth) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, uptime, errorRate, latency, status, degradedPeriods;
            return __generator(this, function (_a) {
                startTime = this.startTimes.get(modelId) || Date.now();
                uptime = Date.now() - startTime;
                errorRate = Math.max(0, currentHealth.metrics.errorRate + (Math.random() * 0.01) - 0.005);
                latency = Math.max(10, currentHealth.metrics.latency + (Math.random() * 20) - 10);
                degradedPeriods = currentHealth.metrics.degradedPeriods;
                if (errorRate > 0.1 || latency > 500) {
                    status = 'failing';
                    degradedPeriods++;
                }
                else if (errorRate > 0.02 || latency > 300) {
                    status = 'degraded';
                    degradedPeriods++;
                }
                else {
                    status = 'healthy';
                }
                return [2 /*return*/, {
                        status: status,
                        uptime: uptime,
                        metrics: {
                            errorRate: errorRate,
                            latency: latency,
                            degradedPeriods: degradedPeriods
                        },
                        lastCheck: Date.now(),
                    }];
            });
        });
    };
    /**
     * Register a model for health monitoring
     */
    ModelHealthMonitorV2.prototype.registerModel = function (modelId) {
        if (!this.health.has(modelId)) {
            var now = Date.now();
            this.startTimes.set(modelId, now);
            var initialHealth = {
                status: 'healthy',
                uptime: 0,
                metrics: {
                    errorRate: 0.005,
                    latency: 150,
                    degradedPeriods: 0
                },
                lastCheck: now
            };
            this.health.set(modelId, initialHealth);
            this.emit('modelRegistered', { modelId: modelId, health: initialHealth });
            this.logger.info("Registered model for health monitoring: ".concat(modelId));
        }
    };
    /**
     * Get health status for a model
     */
    ModelHealthMonitorV2.prototype.getHealth = function (modelId) {
        var health = this.health.get(modelId);
        if (!health) {
            // Auto-register if not found
            this.registerModel(modelId);
            return this.health.get(modelId);
        }
        return health;
    };
    /**
     * Update health metrics manually
     */
    ModelHealthMonitorV2.prototype.updateHealth = function (modelId, metrics) {
        var currentHealth = this.getHealth(modelId) || this.createDefaultHealth(modelId);
        var updatedHealth = __assign(__assign(__assign({}, currentHealth), metrics), { metrics: __assign(__assign({}, currentHealth.metrics), (metrics.metrics || {})), lastCheck: Date.now() });
        var statusChanged = currentHealth.status !== updatedHealth.status;
        this.health.set(modelId, updatedHealth);
        if (statusChanged) {
            this.emit('healthStatusChanged', {
                modelId: modelId,
                previousStatus: currentHealth.status,
                currentStatus: updatedHealth.status,
                health: updatedHealth
            });
        }
        this.emit('healthUpdated', {
            modelId: modelId,
            health: updatedHealth
        });
        this.logger.debug("Updated health for model ".concat(modelId), updatedHealth);
    };
    ModelHealthMonitorV2.prototype.createDefaultHealth = function (modelId) {
        var now = Date.now();
        this.startTimes.set(modelId, now);
        return {
            status: 'healthy',
            uptime: 0,
            metrics: {
                errorRate: 0.005,
                latency: 150,
                degradedPeriods: 0
            },
            lastCheck: now
        };
    };
    /**
     * Dispose of resources
     */
    ModelHealthMonitorV2.prototype.dispose = function () {
        if (this.monitoringInterval) {
            clearInterval(this.monitoringInterval);
            this.monitoringInterval = null;
        }
        this.removeAllListeners();
        this.health.clear();
        this.startTimes.clear();
        this.logger.info('ModelHealthMonitorV2 disposed');
    };
    var _a;
    ModelHealthMonitorV2 = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)('HealthMonitorConfig')),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, Object])
    ], ModelHealthMonitorV2);
    return ModelHealthMonitorV2;
}(events_1.EventEmitter));
exports.ModelHealthMonitorV2 = ModelHealthMonitorV2;
