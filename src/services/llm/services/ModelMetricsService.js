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
exports.ModelMetricsService = void 0;
var events_1 = require("events");
var inversify_1 = require("inversify");
var logger_1 = require("../../../utils/logger");
var types_1 = require("../types");
var IStorageService_1 = require("../../storage/IStorageService");
var ModelMetricsService = /** @class */ (function (_super) {
    __extends(ModelMetricsService, _super);
    function ModelMetricsService(logger, storage) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.storage = storage;
        _this.metrics = new Map();
        _this.retentionPeriod = 24 * 60 * 60 * 1000; // 24 hours
        _this.aggregationInterval = 5 * 60 * 1000; // 5 minutes
        _this.aggregationTimer = null;
        _this.startAggregation();
        return _this;
    }
    /**
     * Record metrics for a model
     */
    ModelMetricsService.prototype.recordMetrics = function (modelId, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var current, updated, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        current = this.metrics.get(modelId) || this.createDefaultMetrics();
                        updated = __assign(__assign(__assign({}, current), metrics), { lastUpdated: Date.now() });
                        this.metrics.set(modelId, updated);
                        return [4 /*yield*/, this.persistMetrics(modelId)];
                    case 1:
                        _a.sent();
                        this.emit(types_1.ModelEvents.MetricsUpdated, {
                            modelId: modelId,
                            metrics: updated
                        });
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        this.handleError('Failed to record metrics', error_1);
                        throw error_1;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get current metrics for a model
     */
    ModelMetricsService.prototype.getMetrics = function (modelId) {
        return this.metrics.get(modelId);
    };
    /**
     * Get aggregated metrics for all models
     */
    ModelMetricsService.prototype.getAggregatedMetrics = function () {
        return new Map(this.metrics);
    };
    ModelMetricsService.prototype.createDefaultMetrics = function () {
        return {
            requestCount: 0,
            successCount: 0,
            errorCount: 0,
            averageLatency: 0,
            tokenUsage: 0,
            memoryUsage: 0,
            lastUpdated: Date.now()
        };
    };
    ModelMetricsService.prototype.persistMetrics = function (modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        metrics = this.metrics.get(modelId);
                        if (!metrics) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.storage.set("metrics:".concat(modelId), metrics)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [3 /*break*/, 4];
                    case 3:
                        error_2 = _a.sent();
                        this.handleError('Failed to persist metrics', error_2);
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    ModelMetricsService.prototype.startAggregation = function () {
        var _this = this;
        this.aggregationTimer = setInterval(function () {
            _this.aggregateMetrics();
        }, this.aggregationInterval);
    };
    ModelMetricsService.prototype.aggregateMetrics = function () {
        try {
            var now = Date.now();
            var cutoff = now - this.retentionPeriod;
            // Clean up old metrics
            for (var _i = 0, _a = this.metrics.entries(); _i < _a.length; _i++) {
                var _b = _a[_i], modelId = _b[0], metrics = _b[1];
                if (metrics.lastUpdated < cutoff) {
                    this.metrics.delete(modelId);
                    this.emit(types_1.ModelEvents.MetricsExpired, { modelId: modelId });
                }
            }
            this.emit(types_1.ModelEvents.MetricsAggregated, {
                timestamp: now,
                metrics: this.getAggregatedMetrics()
            });
        }
        catch (error) {
            this.handleError('Failed to aggregate metrics', error);
        }
    };
    ModelMetricsService.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
    };
    ModelMetricsService.prototype.dispose = function () {
        if (this.aggregationTimer) {
            clearInterval(this.aggregationTimer);
            this.aggregationTimer = null;
        }
        this.removeAllListeners();
        this.metrics.clear();
    };
    var _a, _b;
    ModelMetricsService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(IStorageService_1.IStorageService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, typeof (_b = typeof IStorageService_1.IStorageService !== "undefined" && IStorageService_1.IStorageService) === "function" ? _b : Object])
    ], ModelMetricsService);
    return ModelMetricsService;
}(events_1.EventEmitter));
exports.ModelMetricsService = ModelMetricsService;
