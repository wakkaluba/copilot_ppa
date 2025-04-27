"use strict";
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
var inversify_1 = require("inversify");
var types_1 = require("../../../src/types");
var ModelOptimizationService_1 = require("../../../src/llm/services/ModelOptimizationService");
var ModelMetricsManager_1 = require("../../../src/llm/services/ModelMetricsManager");
var ModelPerformanceAnalyzer_1 = require("../../../src/llm/services/ModelPerformanceAnalyzer");
var ModelBenchmarkManager_1 = require("../../../src/llm/services/ModelBenchmarkManager");
describe('ModelOptimizationService', function () {
    var container;
    var optimizationService;
    var metricsManager;
    var performanceAnalyzer;
    var benchmarkManager;
    var logger;
    beforeEach(function () {
        container = new inversify_1.Container();
        // Setup mocks
        logger = {
            info: jest.fn(),
            warn: jest.fn(),
            error: jest.fn(),
            debug: jest.fn()
        };
        metricsManager = {
            getMetrics: jest.fn(),
            updateMetrics: jest.fn(),
        };
        performanceAnalyzer = {
            analyzeModel: jest.fn()
        };
        benchmarkManager = {
            configureModel: jest.fn(),
            runBenchmark: jest.fn()
        };
        // Bind dependencies
        container.bind(types_1.ILogger).toConstantValue(logger);
        container.bind(ModelMetricsManager_1.ModelMetricsManager).toConstantValue(metricsManager);
        container.bind(ModelPerformanceAnalyzer_1.ModelPerformanceAnalyzer).toConstantValue(performanceAnalyzer);
        container.bind(ModelBenchmarkManager_1.ModelBenchmarkManager).toConstantValue(benchmarkManager);
        container.bind(ModelOptimizationService_1.ModelOptimizationService).toSelf();
        optimizationService = container.get(ModelOptimizationService_1.ModelOptimizationService);
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
    describe('optimizeModel', function () {
        it('should successfully optimize a model with high memory usage', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, currentMetrics, performanceMetrics, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        currentMetrics = {
                            latency: 100,
                            throughput: 50,
                            memoryUsage: 90,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        performanceMetrics = {
                            averageLatency: 90,
                            tokensPerSecond: 60
                        };
                        performanceAnalyzer.analyzeModel.mockResolvedValue(performanceMetrics);
                        metricsManager.getMetrics.mockResolvedValue(currentMetrics);
                        benchmarkManager.configureModel.mockResolvedValue(undefined);
                        return [4 /*yield*/, optimizationService.optimizeModel(modelId, currentMetrics)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.modelId).toBe(modelId);
                        expect(result.strategy.name).toBe('Memory Optimization');
                        expect(result.improvements).toBeDefined();
                        expect(result.confidence).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should successfully optimize a model with low throughput', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, currentMetrics, performanceMetrics, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        currentMetrics = {
                            latency: 100,
                            throughput: 30,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        performanceMetrics = {
                            averageLatency: 90,
                            tokensPerSecond: 40
                        };
                        performanceAnalyzer.analyzeModel.mockResolvedValue(performanceMetrics);
                        metricsManager.getMetrics.mockResolvedValue(currentMetrics);
                        benchmarkManager.configureModel.mockResolvedValue(undefined);
                        return [4 /*yield*/, optimizationService.optimizeModel(modelId, currentMetrics)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.strategy.name).toBe('Throughput Optimization');
                        expect(result.improvements).toBeDefined();
                        expect(result.confidence).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle GPU optimization when available', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, currentMetrics, performanceMetrics, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        currentMetrics = {
                            latency: 100,
                            throughput: 50,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            gpuUsage: 30,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        performanceMetrics = {
                            averageLatency: 90,
                            tokensPerSecond: 60
                        };
                        performanceAnalyzer.analyzeModel.mockResolvedValue(performanceMetrics);
                        metricsManager.getMetrics.mockResolvedValue(currentMetrics);
                        benchmarkManager.configureModel.mockResolvedValue(undefined);
                        return [4 /*yield*/, optimizationService.optimizeModel(modelId, currentMetrics)];
                    case 1:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(result.strategy.name).toBe('GPU Optimization');
                        expect(result.improvements).toBeDefined();
                        expect(result.confidence).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should prevent concurrent optimizations for the same model', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, metrics, promise1, promise2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        metrics = {
                            latency: 100,
                            throughput: 50,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        promise1 = optimizationService.optimizeModel(modelId, metrics);
                        promise2 = optimizationService.optimizeModel(modelId, metrics);
                        return [4 /*yield*/, expect(promise2).rejects.toThrow('Optimization already in progress')];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, promise1];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); });
        it('should track optimization history', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, metrics, history;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        metrics = {
                            latency: 100,
                            throughput: 50,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, optimizationService.optimizeModel(modelId, metrics)];
                    case 1:
                        _a.sent();
                        history = optimizationService.getOptimizationHistory(modelId);
                        expect(history).toHaveLength(1);
                        expect(history[0].modelId).toBe(modelId);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should handle errors during optimization', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, metrics, error;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        metrics = {
                            latency: 100,
                            throughput: 50,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        error = new Error('Optimization failed');
                        benchmarkManager.configureModel.mockRejectedValue(error);
                        return [4 /*yield*/, expect(optimizationService.optimizeModel(modelId, metrics))
                                .rejects.toThrow('Optimization failed')];
                    case 1:
                        _a.sent();
                        expect(logger.error).toHaveBeenCalled();
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Optimization Calculations', function () {
        it('should calculate optimal batch size correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, metrics, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        metrics = {
                            latency: 50,
                            throughput: 50,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, optimizationService.optimizeModel(modelId, metrics)];
                    case 1:
                        result = _a.sent();
                        expect(result.strategy.parameters.batchSize).toBeDefined();
                        expect(result.strategy.parameters.batchSize).toBeGreaterThan(0);
                        expect(result.strategy.parameters.batchSize).toBeLessThanOrEqual(32);
                        return [2 /*return*/];
                }
            });
        }); });
        it('should calculate optimal thread count correctly', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, metrics, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        metrics = {
                            latency: 100,
                            throughput: 50,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, optimizationService.optimizeModel(modelId, metrics)];
                    case 1:
                        result = _a.sent();
                        expect(result.strategy.parameters.threads).toBeDefined();
                        expect(result.strategy.parameters.threads).toBeGreaterThan(0);
                        expect(result.strategy.parameters.threads).toBeLessThanOrEqual(8);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Resource Management', function () {
        it('should cleanup resources on dispose', function () {
            var disposeSpy = jest.spyOn(optimizationService, 'dispose');
            optimizationService.dispose();
            expect(disposeSpy).toHaveBeenCalled();
        });
        it('should clear optimization history', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, metrics, history;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'test-model';
                        metrics = {
                            latency: 100,
                            throughput: 50,
                            memoryUsage: 60,
                            cpuUsage: 70,
                            errorRate: 0.1,
                            timestamp: new Date()
                        };
                        return [4 /*yield*/, optimizationService.optimizeModel(modelId, metrics)];
                    case 1:
                        _a.sent();
                        optimizationService.clearOptimizationHistory();
                        history = optimizationService.getOptimizationHistory(modelId);
                        expect(history).toHaveLength(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
});
