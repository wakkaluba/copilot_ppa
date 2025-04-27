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
exports.ModelTuningService = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../../utils/logger");
var ModelMetricsService_1 = require("./ModelMetricsService");
var types_1 = require("../types");
var events_1 = require("events");
var ModelTuningService = /** @class */ (function (_super) {
    __extends(ModelTuningService, _super);
    function ModelTuningService(logger, metricsService) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsService = metricsService;
        _this.tuningHistory = new Map();
        _this.activeTuning = new Set();
        return _this;
    }
    ModelTuningService.prototype.tuneModel = function (modelId, request) {
        return __awaiter(this, void 0, void 0, function () {
            var metrics, result, history_1, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.activeTuning.has(modelId)) {
                            throw new Error("Tuning already in progress for model ".concat(modelId));
                        }
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, 5, 6]);
                        this.activeTuning.add(modelId);
                        this.emit(types_1.ModelEvents.TuningStarted, { modelId: modelId, request: request });
                        return [4 /*yield*/, this.metricsService.getMetrics(modelId)];
                    case 2:
                        metrics = _a.sent();
                        if (!metrics) {
                            throw new Error("No metrics available for model ".concat(modelId));
                        }
                        return [4 /*yield*/, this.runTuning(modelId, request, metrics)];
                    case 3:
                        result = _a.sent();
                        history_1 = this.tuningHistory.get(modelId) || [];
                        history_1.push(result);
                        this.tuningHistory.set(modelId, history_1);
                        this.emit(types_1.ModelEvents.TuningCompleted, { modelId: modelId, result: result });
                        return [2 /*return*/, result];
                    case 4:
                        error_1 = _a.sent();
                        this.handleError('Tuning failed', error_1);
                        throw error_1;
                    case 5:
                        this.activeTuning.delete(modelId);
                        return [7 /*endfinally*/];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelTuningService.prototype.getTuningHistory = function (modelId) {
        return this.tuningHistory.get(modelId) || [];
    };
    ModelTuningService.prototype.runTuning = function (modelId, request, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            var iterations, parameterSpace, bestResult, i, parameters, improvements, confidence;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iterations = request.maxIterations || 10;
                        parameterSpace = this.defineParameterSpace(request);
                        bestResult = {
                            modelId: modelId,
                            timestamp: new Date(),
                            parameters: this.getInitialParameters(request),
                            improvements: {},
                            confidence: 0
                        };
                        i = 0;
                        _a.label = 1;
                    case 1:
                        if (!(i < iterations)) return [3 /*break*/, 4];
                        parameters = this.generateParameters(parameterSpace, i / iterations);
                        return [4 /*yield*/, this.evaluateParameters(parameters, metrics)];
                    case 2:
                        improvements = _a.sent();
                        confidence = this.calculateConfidence(improvements);
                        if (confidence > bestResult.confidence) {
                            bestResult = {
                                modelId: modelId,
                                timestamp: new Date(),
                                parameters: parameters,
                                improvements: improvements,
                                confidence: confidence
                            };
                        }
                        this.emit(types_1.ModelEvents.TuningProgress, {
                            modelId: modelId,
                            iteration: i + 1,
                            totalIterations: iterations,
                            currentBest: bestResult
                        });
                        _a.label = 3;
                    case 3:
                        i++;
                        return [3 /*break*/, 1];
                    case 4: return [2 /*return*/, bestResult];
                }
            });
        });
    };
    ModelTuningService.prototype.defineParameterSpace = function (request) {
        var space = new Map();
        // Define parameter ranges based on request
        if (request.temperatureRange) {
            space.set('temperature', request.temperatureRange);
        }
        if (request.topPRange) {
            space.set('topP', request.topPRange);
        }
        if (request.frequencyPenaltyRange) {
            space.set('frequencyPenalty', request.frequencyPenaltyRange);
        }
        if (request.presencePenaltyRange) {
            space.set('presencePenalty', request.presencePenaltyRange);
        }
        return space;
    };
    ModelTuningService.prototype.getInitialParameters = function (request) {
        var _a, _b, _c, _d;
        return {
            temperature: ((_a = request.initialParameters) === null || _a === void 0 ? void 0 : _a.temperature) || 0.7,
            topP: ((_b = request.initialParameters) === null || _b === void 0 ? void 0 : _b.topP) || 1.0,
            frequencyPenalty: ((_c = request.initialParameters) === null || _c === void 0 ? void 0 : _c.frequencyPenalty) || 0.0,
            presencePenalty: ((_d = request.initialParameters) === null || _d === void 0 ? void 0 : _d.presencePenalty) || 0.0
        };
    };
    ModelTuningService.prototype.generateParameters = function (parameterSpace, progress) {
        var parameters = {};
        var explorationFactor = Math.max(0.1, 1 - progress);
        for (var _i = 0, _a = parameterSpace.entries(); _i < _a.length; _i++) {
            var _b = _a[_i], param = _b[0], _c = _b[1], min = _c[0], max = _c[1];
            var range = max - min;
            var mutation = (Math.random() - 0.5) * range * explorationFactor;
            parameters[param] = Math.max(min, Math.min(max, this.getCurrentValue(param) + mutation));
        }
        return parameters;
    };
    ModelTuningService.prototype.getCurrentValue = function (param) {
        // Default values for parameters
        var defaults = {
            temperature: 0.7,
            topP: 1.0,
            frequencyPenalty: 0.0,
            presencePenalty: 0.0
        };
        return defaults[param] || 0;
    };
    ModelTuningService.prototype.evaluateParameters = function (parameters, metrics) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Simulate parameter evaluation (replace with actual evaluation logic)
                return [2 /*return*/, {
                        responseTime: this.estimateResponseTimeImprovement(parameters, metrics),
                        quality: this.estimateQualityImprovement(parameters, metrics),
                        efficiency: this.estimateEfficiencyImprovement(parameters, metrics)
                    }];
            });
        });
    };
    ModelTuningService.prototype.estimateResponseTimeImprovement = function (parameters, metrics) {
        // Implementation would estimate response time improvement
        return Math.random() * 20; // Placeholder
    };
    ModelTuningService.prototype.estimateQualityImprovement = function (parameters, metrics) {
        // Implementation would estimate quality improvement
        return Math.random() * 15; // Placeholder
    };
    ModelTuningService.prototype.estimateEfficiencyImprovement = function (parameters, metrics) {
        // Implementation would estimate efficiency improvement
        return Math.random() * 25; // Placeholder
    };
    ModelTuningService.prototype.calculateConfidence = function (improvements) {
        var weights = {
            responseTime: 0.3,
            quality: 0.4,
            efficiency: 0.3
        };
        return Object.entries(improvements).reduce(function (sum, _a) {
            var key = _a[0], value = _a[1];
            return sum + (value * weights[key]);
        }, 0) / 100;
    };
    ModelTuningService.prototype.handleError = function (message, error) {
        this.logger.error(message, { error: error });
    };
    ModelTuningService.prototype.dispose = function () {
        this.removeAllListeners();
        this.tuningHistory.clear();
        this.activeTuning.clear();
    };
    var _a;
    ModelTuningService = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService])
    ], ModelTuningService);
    return ModelTuningService;
}(events_1.EventEmitter));
exports.ModelTuningService = ModelTuningService;
