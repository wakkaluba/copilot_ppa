"use strict";
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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTuningService = void 0;
const inversify_1 = require("inversify");
const logger_1 = require("../../../utils/logger");
const ModelMetricsService_1 = require("./ModelMetricsService");
const types_1 = require("../types");
const events_1 = require("events");
let ModelTuningService = class ModelTuningService extends events_1.EventEmitter {
    logger;
    metricsService;
    tuningHistory = new Map();
    activeTuning = new Set();
    constructor(logger, metricsService) {
        super();
        this.logger = logger;
        this.metricsService = metricsService;
    }
    async tuneModel(modelId, request) {
        if (this.activeTuning.has(modelId)) {
            throw new Error(`Tuning already in progress for model ${modelId}`);
        }
        try {
            this.activeTuning.add(modelId);
            this.emit(types_1.ModelEvents.TuningStarted, { modelId, request });
            const metrics = await this.metricsService.getMetrics(modelId);
            if (!metrics) {
                throw new Error(`No metrics available for model ${modelId}`);
            }
            const result = await this.runTuning(modelId, request, metrics);
            // Store tuning history
            const history = this.tuningHistory.get(modelId) || [];
            history.push(result);
            this.tuningHistory.set(modelId, history);
            this.emit(types_1.ModelEvents.TuningCompleted, { modelId, result });
            return result;
        }
        catch (error) {
            this.handleError('Tuning failed', error);
            throw error;
        }
        finally {
            this.activeTuning.delete(modelId);
        }
    }
    getTuningHistory(modelId) {
        return this.tuningHistory.get(modelId) || [];
    }
    async runTuning(modelId, request, metrics) {
        const iterations = request.maxIterations || 10;
        const parameterSpace = this.defineParameterSpace(request);
        let bestResult = {
            modelId,
            timestamp: new Date(),
            parameters: this.getInitialParameters(request),
            improvements: {},
            confidence: 0
        };
        for (let i = 0; i < iterations; i++) {
            const parameters = this.generateParameters(parameterSpace, i / iterations);
            const improvements = await this.evaluateParameters(parameters, metrics);
            const confidence = this.calculateConfidence(improvements);
            if (confidence > bestResult.confidence) {
                bestResult = {
                    modelId,
                    timestamp: new Date(),
                    parameters,
                    improvements,
                    confidence
                };
            }
            this.emit(types_1.ModelEvents.TuningProgress, {
                modelId,
                iteration: i + 1,
                totalIterations: iterations,
                currentBest: bestResult
            });
        }
        return bestResult;
    }
    defineParameterSpace(request) {
        const space = new Map();
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
    }
    getInitialParameters(request) {
        return {
            temperature: request.initialParameters?.temperature || 0.7,
            topP: request.initialParameters?.topP || 1.0,
            frequencyPenalty: request.initialParameters?.frequencyPenalty || 0.0,
            presencePenalty: request.initialParameters?.presencePenalty || 0.0
        };
    }
    generateParameters(parameterSpace, progress) {
        const parameters = {};
        const explorationFactor = Math.max(0.1, 1 - progress);
        for (const [param, [min, max]] of parameterSpace.entries()) {
            const range = max - min;
            const mutation = (Math.random() - 0.5) * range * explorationFactor;
            parameters[param] = Math.max(min, Math.min(max, this.getCurrentValue(param) + mutation));
        }
        return parameters;
    }
    getCurrentValue(param) {
        // Default values for parameters
        const defaults = {
            temperature: 0.7,
            topP: 1.0,
            frequencyPenalty: 0.0,
            presencePenalty: 0.0
        };
        return defaults[param] || 0;
    }
    async evaluateParameters(parameters, metrics) {
        // Simulate parameter evaluation (replace with actual evaluation logic)
        return {
            responseTime: this.estimateResponseTimeImprovement(parameters, metrics),
            quality: this.estimateQualityImprovement(parameters, metrics),
            efficiency: this.estimateEfficiencyImprovement(parameters, metrics)
        };
    }
    estimateResponseTimeImprovement(parameters, metrics) {
        // Implementation would estimate response time improvement
        return Math.random() * 20; // Placeholder
    }
    estimateQualityImprovement(parameters, metrics) {
        // Implementation would estimate quality improvement
        return Math.random() * 15; // Placeholder
    }
    estimateEfficiencyImprovement(parameters, metrics) {
        // Implementation would estimate efficiency improvement
        return Math.random() * 25; // Placeholder
    }
    calculateConfidence(improvements) {
        const weights = {
            responseTime: 0.3,
            quality: 0.4,
            efficiency: 0.3
        };
        return Object.entries(improvements).reduce((sum, [key, value]) => {
            return sum + (value * weights[key]);
        }, 0) / 100;
    }
    handleError(message, error) {
        this.logger.error(message, { error });
    }
    dispose() {
        this.removeAllListeners();
        this.tuningHistory.clear();
        this.activeTuning.clear();
    }
};
exports.ModelTuningService = ModelTuningService;
exports.ModelTuningService = ModelTuningService = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logger_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __metadata("design:paramtypes", [typeof (_a = typeof logger_1.ILogger !== "undefined" && logger_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService])
], ModelTuningService);
//# sourceMappingURL=ModelTuningService.js.map