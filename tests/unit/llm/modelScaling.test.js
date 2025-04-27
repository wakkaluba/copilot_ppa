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
var ModelScalingService_1 = require("../../../src/llm/services/ModelScalingService");
var ModelScalingMetricsService_1 = require("../../../src/llm/services/ModelScalingMetricsService");
var ModelScalingDashboardService_1 = require("../../../src/llm/services/ModelScalingDashboardService");
jest.mock('vscode');
jest.mock('../../../src/utils/logger');
jest.mock('../../../src/llm/services/ModelMetricsService');
jest.mock('../../../src/llm/services/ModelHealthMonitorV2');
jest.mock('../../../src/llm/services/ModelScalingPolicy');
jest.mock('../../../src/llm/services/ModelDeploymentService');
describe('Model Scaling System', function () {
    var scalingService;
    var metricsService;
    var mockLogger;
    var mockScalingPolicy;
    var mockDeploymentService;
    beforeEach(function () {
        mockLogger = {
            log: jest.fn(),
            error: jest.fn(),
            warn: jest.fn(),
            info: jest.fn(),
            debug: jest.fn()
        };
        mockScalingPolicy = {
            evaluateScalingDecision: jest.fn().mockResolvedValue({
                action: 'no_action',
                reason: 'Current capacity is sufficient',
                modelId: 'test-model',
                timestamp: new Date(),
                metrics: {},
                rule: undefined,
                replicas: undefined,
                resources: undefined
            }),
            on: jest.fn(),
            removeAllListeners: jest.fn(),
            getScalingRules: jest.fn(),
            setScalingRules: jest.fn(),
            getRecentDecisions: jest.fn(),
            dispose: jest.fn()
        };
        mockDeploymentService = {
            listDeployments: jest.fn().mockResolvedValue([
                { id: 'deployment-1', modelId: 'test-model', config: { replicas: 3 } }
            ]),
            updateDeployment: jest.fn().mockResolvedValue(undefined),
            getDeployment: jest.fn().mockResolvedValue({
                id: 'deployment-1',
                modelId: 'test-model',
                config: { replicas: 3 }
            }),
            createDeployment: jest.fn(),
            deleteDeployment: jest.fn(),
            scaleDeployment: jest.fn().mockResolvedValue(undefined)
        };
        // Add missing scaleModelDeployment method to the mock
        mockDeploymentService.scaleModelDeployment = jest.fn().mockResolvedValue(undefined);
        metricsService = new ModelScalingMetricsService_1.ModelScalingMetricsService(mockLogger);
        var dashboardService = new ModelScalingDashboardService_1.ModelScalingDashboardService(mockLogger, metricsService);
        scalingService = new ModelScalingService_1.ModelScalingService(mockLogger, metricsService, mockScalingPolicy, mockDeploymentService, dashboardService);
    });
    describe('Scaling Strategy Tests', function () {
        test('should scale up when load exceeds threshold', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockScalingDecision, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Setup high load scenario
                    return [4 /*yield*/, metricsService.updateMetrics('test-model', {
                            timestamp: new Date(),
                            performance: {
                                responseTime: 500,
                                throughput: 50,
                                errorRate: 0.01,
                                requestRate: 100
                            },
                            resources: {
                                cpu: 85,
                                memory: 90,
                                gpu: 95,
                                networkIO: 70
                            },
                            scaling: {
                                currentNodes: 3,
                                activeConnections: 80,
                                queueLength: 40
                            },
                            availability: {
                                uptime: 7200000,
                                successRate: 0.99,
                                degradedPeriods: 0
                            }
                        })];
                    case 1:
                        // Setup high load scenario
                        _a.sent();
                        mockScalingDecision = {
                            action: 'scale_up',
                            reason: 'High CPU and memory utilization',
                            modelId: 'test-model',
                            timestamp: new Date(),
                            metrics: {},
                            rule: undefined,
                            replicas: 1,
                            resources: undefined
                        };
                        mockScalingPolicy.evaluateScalingDecision.mockResolvedValue(mockScalingDecision);
                        return [4 /*yield*/, scalingService.scaleModel('test-model', 4, 'Test scaling up')];
                    case 2:
                        result = _a.sent();
                        expect(result.action).toBe('scale_up');
                        expect(result.targetReplicas).toBe(4);
                        expect(mockDeploymentService.scaleModelDeployment).toHaveBeenCalledWith('test-model', 4);
                        return [2 /*return*/];
                }
            });
        }); });
        test('should scale down when load is low', function () { return __awaiter(void 0, void 0, void 0, function () {
            var mockScalingDecision, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // Setup low load scenario
                    return [4 /*yield*/, metricsService.updateMetrics('test-model', {
                            timestamp: new Date(),
                            performance: {
                                responseTime: 100,
                                throughput: 20,
                                errorRate: 0.001,
                                requestRate: 10
                            },
                            resources: {
                                cpu: 15,
                                memory: 20,
                                gpu: 10,
                                networkIO: 5
                            },
                            scaling: {
                                currentNodes: 3,
                                activeConnections: 5,
                                queueLength: 0
                            },
                            availability: {
                                uptime: 7200000,
                                successRate: 1.0,
                                degradedPeriods: 0
                            }
                        })];
                    case 1:
                        // Setup low load scenario
                        _a.sent();
                        mockScalingDecision = {
                            action: 'scale_down',
                            reason: 'Low resource utilization',
                            modelId: 'test-model',
                            timestamp: new Date(),
                            metrics: {},
                            rule: undefined,
                            replicas: 1,
                            resources: undefined
                        };
                        mockScalingPolicy.evaluateScalingDecision.mockResolvedValue(mockScalingDecision);
                        return [4 /*yield*/, scalingService.scaleModel('test-model', 2, 'Test scaling down')];
                    case 2:
                        result = _a.sent();
                        expect(result.action).toBe('scale_down');
                        expect(result.targetReplicas).toBe(2);
                        expect(mockDeploymentService.scaleModelDeployment).toHaveBeenCalledWith('test-model', 2);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    describe('Resource Management Tests', function () {
        test('should handle deployment with resource constraints', function () { return __awaiter(void 0, void 0, void 0, function () {
            var modelId, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        modelId = 'resource-constrained-model';
                        // Setup metrics with resource constraints
                        return [4 /*yield*/, metricsService.updateMetrics(modelId, {
                                timestamp: new Date(),
                                performance: {
                                    responseTime: 300,
                                    throughput: 25,
                                    errorRate: 0.02,
                                    requestRate: 50
                                },
                                resources: {
                                    cpu: 95,
                                    memory: 88,
                                    gpu: 45,
                                    networkIO: 60
                                },
                                scaling: {
                                    currentNodes: 2,
                                    activeConnections: 40,
                                    queueLength: 15
                                },
                                availability: {
                                    uptime: 3600000,
                                    successRate: 0.97,
                                    degradedPeriods: 2
                                }
                            })];
                    case 1:
                        // Setup metrics with resource constraints
                        _a.sent();
                        // Mock that the deployment service will report resource constraints
                        mockDeploymentService.getDeployment.mockResolvedValue({
                            id: 'deployment-constrained',
                            modelId: modelId,
                            replicas: 2,
                            resources: {
                                cpu: '2',
                                memory: '4Gi'
                            }
                        });
                        return [4 /*yield*/, scalingService.scaleModel(modelId, 4)];
                    case 2:
                        result = _a.sent();
                        expect(result).toBeDefined();
                        expect(mockDeploymentService.scaleModelDeployment).toHaveBeenCalledWith(modelId, 4);
                        return [2 /*return*/];
                }
            });
        }); });
    });
    afterEach(function () {
        jest.clearAllMocks();
    });
});
