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
exports.ModelOptimizer = void 0;
var inversify_1 = require("inversify");
var logger_1 = require("../../utils/logger");
var events_1 = require("events");
/**
 * Service for optimizing model performance and resource usage
 */
var ModelOptimizer = /** @class */ (function (_super) {
    __extends(ModelOptimizer, _super);
    function ModelOptimizer(logger) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.logger.info('ModelOptimizer initialized');
        return _this;
    }
    /**
     * Optimize a model based on current metrics
     */
    ModelOptimizer.prototype.optimizeModel = function (modelId, currentMetrics) {
        return __awaiter(this, void 0, void 0, function () {
            var result, errorMessage;
            return __generator(this, function (_a) {
                try {
                    this.logger.info("Starting optimization for model ".concat(modelId));
                    // Validate input
                    if (!modelId) {
                        throw new Error('Model ID is required');
                    }
                    if (!currentMetrics) {
                        throw new Error('Current metrics are required for optimization');
                    }
                    result = this.analyzeMetrics(modelId, currentMetrics);
                    if (result.success) {
                        this.emit('optimization.success', {
                            modelId: modelId,
                            recommendations: result.recommendations
                        });
                        this.logger.info("Model ".concat(modelId, " optimization successful"), result);
                    }
                    else {
                        this.emit('optimization.failure', {
                            modelId: modelId,
                            error: result.error
                        });
                        this.logger.warn("Model ".concat(modelId, " optimization failed: ").concat(result.error));
                    }
                    return [2 /*return*/, result];
                }
                catch (error) {
                    errorMessage = error instanceof Error ? error.message : String(error);
                    this.logger.error("Error optimizing model ".concat(modelId), error);
                    this.emit('optimization.error', { modelId: modelId, error: error });
                    return [2 /*return*/, {
                            success: false,
                            modelId: modelId,
                            metrics: {
                                latency: 0,
                                throughput: 0,
                                errorRate: 0,
                                costEfficiency: 0
                            },
                            recommendations: {},
                            error: errorMessage
                        }];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Analyze metrics and generate optimization recommendations
     */
    ModelOptimizer.prototype.analyzeMetrics = function (modelId, metrics) {
        try {
            // Extract metrics
            var responseTime = metrics.averageResponseTime || 0;
            var throughput = metrics.requestRate || 0;
            var errorRate = metrics.errorRate || 0;
            // Default result
            var result = {
                success: true,
                modelId: modelId,
                metrics: {
                    latency: responseTime,
                    throughput: throughput,
                    errorRate: errorRate,
                    costEfficiency: this.calculateCostEfficiency(responseTime, throughput, errorRate)
                },
                recommendations: {}
            };
            // High latency optimization
            if (responseTime > 500) {
                result.recommendations.batchSize = Math.max(1, Math.floor((responseTime / 500) * 4));
                result.recommendations.maxTokens = 1024;
                result.recommendations.quantization = 'int8';
            }
            // Low latency, can potentially improve quality
            else if (responseTime < 100) {
                result.recommendations.temperature = 0.7;
                result.recommendations.topP = 0.9;
            }
            // Error rate optimization
            if (errorRate > 0.05) {
                result.recommendations.temperature = 0.3;
                result.recommendations.maxTokens = 2048;
            }
            // Throughput optimization
            if (throughput > 100) {
                result.recommendations.batchSize = 8;
                result.recommendations.quantization = 'int8';
                result.recommendations.pruning = 0.3;
            }
            return result;
        }
        catch (error) {
            this.logger.error("Error analyzing metrics for model ".concat(modelId), error);
            return {
                success: false,
                modelId: modelId,
                metrics: {
                    latency: 0,
                    throughput: 0,
                    errorRate: 0,
                    costEfficiency: 0
                },
                recommendations: {},
                error: error instanceof Error ? error.message : 'Unknown error during metrics analysis'
            };
        }
    };
    /**
     * Calculate cost efficiency score
     */
    ModelOptimizer.prototype.calculateCostEfficiency = function (latency, throughput, errorRate) {
        // Simple cost efficiency formula: throughput / (latency * (1 + errorRate))
        // Higher is better, normalized to 0-100 scale
        if (latency <= 0 || throughput <= 0) {
            return 0;
        }
        var rawScore = throughput / (latency * (1 + errorRate));
        return Math.min(100, Math.max(0, rawScore * 100));
    };
    /**
     * Dispose of resources
     */
    ModelOptimizer.prototype.dispose = function () {
        this.removeAllListeners();
        this.logger.info('ModelOptimizer disposed');
    };
    var _a;
    ModelOptimizer = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
        __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object])
    ], ModelOptimizer);
    return ModelOptimizer;
}(events_1.EventEmitter));
exports.ModelOptimizer = ModelOptimizer;
