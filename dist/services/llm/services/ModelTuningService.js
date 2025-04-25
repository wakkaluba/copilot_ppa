"use strict";
var __esDecorate = (this && this.__esDecorate) || function (ctor, descriptorIn, decorators, contextIn, initializers, extraInitializers) {
    function accept(f) { if (f !== void 0 && typeof f !== "function") throw new TypeError("Function expected"); return f; }
    var kind = contextIn.kind, key = kind === "getter" ? "get" : kind === "setter" ? "set" : "value";
    var target = !descriptorIn && ctor ? contextIn["static"] ? ctor : ctor.prototype : null;
    var descriptor = descriptorIn || (target ? Object.getOwnPropertyDescriptor(target, contextIn.name) : {});
    var _, done = false;
    for (var i = decorators.length - 1; i >= 0; i--) {
        var context = {};
        for (var p in contextIn) context[p] = p === "access" ? {} : contextIn[p];
        for (var p in contextIn.access) context.access[p] = contextIn.access[p];
        context.addInitializer = function (f) { if (done) throw new TypeError("Cannot add initializers after decoration has completed"); extraInitializers.push(accept(f || null)); };
        var result = (0, decorators[i])(kind === "accessor" ? { get: descriptor.get, set: descriptor.set } : descriptor[key], context);
        if (kind === "accessor") {
            if (result === void 0) continue;
            if (result === null || typeof result !== "object") throw new TypeError("Object expected");
            if (_ = accept(result.get)) descriptor.get = _;
            if (_ = accept(result.set)) descriptor.set = _;
            if (_ = accept(result.init)) initializers.unshift(_);
        }
        else if (_ = accept(result)) {
            if (kind === "field") initializers.unshift(_);
            else descriptor[key] = _;
        }
    }
    if (target) Object.defineProperty(target, contextIn.name, descriptor);
    done = true;
};
var __runInitializers = (this && this.__runInitializers) || function (thisArg, initializers, value) {
    var useValue = arguments.length > 2;
    for (var i = 0; i < initializers.length; i++) {
        value = useValue ? initializers[i].call(thisArg, value) : initializers[i].call(thisArg);
    }
    return useValue ? value : void 0;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelTuningService = void 0;
const inversify_1 = require("inversify");
const types_1 = require("../types");
const events_1 = require("events");
let ModelTuningService = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelTuningService = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelTuningService = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
                timestamp: Date.now(),
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
                        timestamp: Date.now(),
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
    return ModelTuningService = _classThis;
})();
exports.ModelTuningService = ModelTuningService;
//# sourceMappingURL=ModelTuningService.js.map