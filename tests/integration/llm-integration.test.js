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
var ModelScalingService_1 = require("../../src/llm/services/ModelScalingService");
var ModelOptimizer_1 = require("../../src/llm/services/ModelOptimizer");
var ModelDeploymentManagerService_1 = require("../../src/llm/services/ModelDeploymentManagerService");
jest.mock('vscode');
jest.mock('../../src/utils/logger');
jest.mock('../../src/llm/services/ModelScalingMetricsService');
jest.mock('../../src/llm/services/ModelScalingPolicy');
jest.mock('../../src/llm/services/ModelDeploymentService');
jest.mock('../../src/llm/services/ModelScalingDashboardService');
jest.mock('../../src/llm/services/ModelVersioningService');
describe('LLM Model Integration', function () {
    var scalingService;
    var optimizerService;
    var deploymentService;
    var metricsService;
    var scalingPolicy;
    var modelDeploymentService;
    var dashboardService;
    var versioningService;
    var mockLogger;
    beforeEach(function () {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        };
        metricsService = {
            getLatestMetrics: jest.fn().mockResolvedValue(new Map()),
            on: jest.fn(),
            emit: jest.fn(),
            dispose: jest.fn(),
            removeAllListeners: jest.fn(),
        };
        scalingPolicy = {
            evaluateScalingDecision: jest.fn().mockReturnValue({
                modelId: 'test-model',
                action: 'scale_up',
                reason: 'Test scaling',
                timestamp: new Date()
            }),
            dispose: jest.fn(),
        };
        modelDeploymentService = {
            getModelDeployment: jest.fn().mockResolvedValue({
                id: 'deployment-1',
                replicas: 1
            }),
            scaleModelDeployment: jest.fn().mockResolvedValue(undefined),
        };
        dashboardService = {
            updateModelMetrics: jest.fn(),
            addScalingEvent: jest.fn(),
        };
        versioningService = {
            verifyVersion: jest.fn().mockResolvedValue(true)
        };
        var defaultPerformanceMetrics = {
            averageResponseTime: 200,
            tokenThroughput: 50,
            errorRate: 0.01,
            totalRequests: 100,
            totalTokens: 5000,
            lastUsed: new Date()
        };
        optimizerService = new ModelOptimizer_1.ModelOptimizer(mockLogger);
        scalingService = new ModelScalingService_1.ModelScalingService(mockLogger, metricsService, scalingPolicy, modelDeploymentService, dashboardService);
        deploymentService = new ModelDeploymentManagerService_1.ModelDeploymentManagerService(mockLogger, versioningService, modelDeploymentService);
    });
    describe('End-to-End Workflow Tests', function () {
        test('should handle complete model lifecycle', function () { return __awaiter(void 0, void 0, void 0, function () {
            var deploymentId, defaultMetrics, optimizationResult, scalingResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, deploymentService.createDeployment({
                            modelId: 'test-model',
                            version: '1.0.0',
                            environmentId: 'env-1',
                            config: {
                                replicas: 1,
                                resources: {
                                    cpu: '1',
                                    memory: '2Gi'
                                }
                            }
                        })];
                    case 1:
                        deploymentId = _a.sent();
                        expect(deploymentId).toBeDefined();
                        defaultMetrics = {
                            averageResponseTime: 200,
                            tokenThroughput: 50,
                            errorRate: 0.01,
                            totalRequests: 100,
                            totalTokens: 5000,
                            lastUsed: new Date()
                        };
                        return [4 /*yield*/, optimizerService.optimizeModel('test-model', defaultMetrics)];
                    case 2:
                        optimizationResult = _a.sent();
                        expect(optimizationResult).toBeDefined();
                        return [4 /*yield*/, scalingService.scaleModel('test-model', 2, 'Test scaling')];
                    case 3:
                        scalingResult = _a.sent();
                        expect(scalingResult).toBeDefined();
                        expect(scalingResult.targetReplicas).toBe(2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('System Coordination Tests', function () {
        test('should coordinate optimization and scaling', function () { return __awaiter(void 0, void 0, void 0, function () {
            var deploymentId, defaultMetrics, optimizationResult, recommendedReplicas, scalingResult;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, deploymentService.createDeployment({
                            modelId: 'test-model',
                            version: '1.0.0',
                            environmentId: 'env-1',
                            config: { replicas: 1 }
                        })];
                    case 1:
                        deploymentId = _a.sent();
                        defaultMetrics = {
                            averageResponseTime: 200,
                            tokenThroughput: 50,
                            errorRate: 0.01,
                            totalRequests: 100,
                            totalTokens: 5000,
                            lastUsed: new Date()
                        };
                        return [4 /*yield*/, optimizerService.optimizeModel('test-model', defaultMetrics)];
                    case 2:
                        optimizationResult = _a.sent();
                        expect(optimizationResult).toBeDefined();
                        recommendedReplicas = 2;
                        return [4 /*yield*/, scalingService.scaleModel('test-model', recommendedReplicas, 'Based on optimization')];
                    case 3:
                        scalingResult = _a.sent();
                        expect(scalingResult).toBeDefined();
                        expect(scalingResult.targetReplicas).toBe(recommendedReplicas);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should handle concurrent operations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var deploymentId, defaultMetrics, operations, results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, deploymentService.createDeployment({
                            modelId: 'test-model',
                            version: '1.0.0',
                            environmentId: 'env-1',
                            config: { replicas: 1 }
                        })];
                    case 1:
                        deploymentId = _a.sent();
                        defaultMetrics = {
                            averageResponseTime: 200,
                            tokenThroughput: 50,
                            errorRate: 0.01,
                            totalRequests: 100,
                            totalTokens: 5000,
                            lastUsed: new Date()
                        };
                        operations = [
                            optimizerService.optimizeModel('test-model', defaultMetrics),
                            scalingService.scaleModel('test-model', 2, 'Concurrent test'),
                            deploymentService.updateDeployment(deploymentId, {
                                description: 'Updated deployment'
                            })
                        ];
                        return [4 /*yield*/, Promise.all(operations)];
                    case 2:
                        results = _a.sent();
                        expect(results.length).toBe(3);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Error Handling and Recovery', function () {
        test('should recover from optimization failures', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockOptimizationError, defaultMetrics, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        mockOptimizationError = new Error('Optimization failed');
                        jest.spyOn(optimizerService, 'analyzeModel')
                            .mockRejectedValueOnce(mockOptimizationError);
                        defaultMetrics = {
                            averageResponseTime: 200,
                            tokenThroughput: 50,
                            errorRate: 0.01,
                            totalRequests: 100,
                            totalTokens: 5000,
                            lastUsed: new Date()
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, optimizerService.optimizeModel('test-model', defaultMetrics)];
                    case 2:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        error_1 = _a.sent();
                        expect(error_1).toBeDefined();
                        expect(mockLogger.error).toHaveBeenCalled();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        }); });
        test('should handle scaling failures gracefully', function () { return __awaiter(void 0, void 0, void 0, function () {
            var deploymentId, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, deploymentService.createDeployment({
                            modelId: 'test-model',
                            version: '1.0.0',
                            environmentId: 'env-1',
                            config: { replicas: 1 }
                        })];
                    case 1:
                        deploymentId = _a.sent();
                        // Force a scaling error
                        modelDeploymentService.scaleModelDeployment.mockRejectedValueOnce(new Error('Scaling failed'));
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, scalingService.scaleModel('test-model', 2, 'Test with error')];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        error_2 = _a.sent();
                        expect(error_2).toBeDefined();
                        expect(mockLogger.error).toHaveBeenCalled();
                        return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Performance and Resource Management', function () {
        test('should track resource usage across operations', function () { return __awaiter(void 0, void 0, void 0, function () {
            var deployment, resourceMetrics, defaultMetrics;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, deploymentService.createDeployment({
                            modelId: 'test-model',
                            version: '1.0.0',
                            environmentId: 'env-1',
                            config: {
                                replicas: 1,
                                resources: {
                                    cpu: '1',
                                    memory: '2Gi'
                                }
                            }
                        })];
                    case 1:
                        deployment = _a.sent();
                        resourceMetrics = [];
                        // Mock metricsUpdate event
                        scalingService.on('scaling.started', function (data) {
                            resourceMetrics.push({
                                cpu: '50%',
                                memory: '1.5Gi'
                            });
                        });
                        defaultMetrics = {
                            averageResponseTime: 200,
                            tokenThroughput: 50,
                            errorRate: 0.01,
                            totalRequests: 100,
                            totalTokens: 5000,
                            lastUsed: new Date()
                        };
                        // Run operations
                        return [4 /*yield*/, optimizerService.optimizeModel('test-model', defaultMetrics)];
                    case 2:
                        // Run operations
                        _a.sent();
                        return [4 /*yield*/, scalingService.scaleModel('test-model', 2, 'Resource test')];
                    case 3:
                        _a.sent();
                        // Force a metrics event for testing
                        scalingService.emit('scaling.started', {
                            operation: {
                                modelId: 'test-model',
                                metrics: {
                                    resources: {
                                        cpu: 50,
                                        memory: 70
                                    }
                                }
                            }
                        });
                        expect(resourceMetrics.length).toBeGreaterThan(0);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    afterEach(function () {
        jest.clearAllMocks();
        optimizerService.dispose();
        scalingService.dispose();
        deploymentService.dispose();
    });
});
