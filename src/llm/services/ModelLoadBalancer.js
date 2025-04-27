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
exports.ModelLoadBalancer = void 0;
var vscode = require("vscode");
var inversify_1 = require("inversify");
var events_1 = require("events");
var logging_1 = require("../../common/logging");
var ModelMetricsService_1 = require("./ModelMetricsService");
var ModelHostManager_1 = require("./ModelHostManager");
var ModelLoadBalancer = /** @class */ (function (_super) {
    __extends(ModelLoadBalancer, _super);
    function ModelLoadBalancer(logger, metricsService, hostManager) {
        var _this = _super.call(this) || this;
        _this.logger = logger;
        _this.metricsService = metricsService;
        _this.hostManager = hostManager;
        _this.nodeHealth = new Map();
        _this.distributionHistory = [];
        _this.outputChannel = vscode.window.createOutputChannel('Model Load Balancer');
        _this.metrics = _this.initializeMetrics();
        _this.startMonitoring();
        return _this;
    }
    ModelLoadBalancer.prototype.startMonitoring = function () {
        var _this = this;
        this.healthCheckInterval = setInterval(function () { return _this.checkNodeHealth(); }, 30000);
        this.emit('monitoringStarted');
        this.logger.info('Load balancer monitoring started');
    };
    ModelLoadBalancer.prototype.distributeRequest = function (requestId, modelId) {
        return __awaiter(this, void 0, void 0, function () {
            var startTime, nodes, selectedNode, result;
            return __generator(this, function (_a) {
                try {
                    startTime = Date.now();
                    nodes = Array.from(this.nodeHealth.entries());
                    if (nodes.length === 0) {
                        throw new Error('No available nodes for request distribution');
                    }
                    selectedNode = this.selectNode(nodes, requestId);
                    if (!selectedNode) {
                        throw new Error('No healthy nodes available');
                    }
                    result = {
                        nodeId: selectedNode.nodeId,
                        success: true,
                        timestamp: new Date(),
                        latency: Date.now() - startTime
                    };
                    this.updateDistributionMetrics(result);
                    this.emit('requestDistributed', { requestId: requestId, nodeId: selectedNode.nodeId });
                    return [2 /*return*/, selectedNode.nodeId];
                }
                catch (error) {
                    this.handleError('Failed to distribute request', error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelLoadBalancer.prototype.selectNode = function (nodes, requestId) {
        var _this = this;
        var healthyNodes = nodes.filter(function (_a) {
            var _ = _a[0], health = _a[1];
            return health.status === 'healthy';
        });
        if (healthyNodes.length === 0) {
            return undefined;
        }
        // Use weighted round-robin with health scores
        var weightedNodes = healthyNodes.map(function (_a) {
            var _ = _a[0], node = _a[1];
            return ({
                node: node,
                weight: _this.calculateNodeWeight(node)
            });
        });
        return this.selectWeightedNode(weightedNodes);
    };
    ModelLoadBalancer.prototype.calculateNodeWeight = function (node) {
        var cpuScore = 1 - (node.metrics.cpu / 100);
        var memoryScore = 1 - (node.metrics.memory / 100);
        var loadScore = 1 - (node.metrics.requestLoad / 100);
        // Consider latency if available
        var latencyScore = node.metrics.latency
            ? 1 - Math.min(node.metrics.latency / 1000, 1)
            : 1;
        return (cpuScore * 0.3 + memoryScore * 0.3 + loadScore * 0.2 + latencyScore * 0.2);
    };
    ModelLoadBalancer.prototype.selectWeightedNode = function (weightedNodes) {
        var totalWeight = weightedNodes.reduce(function (sum, _a) {
            var weight = _a.weight;
            return sum + weight;
        }, 0);
        var random = Math.random() * totalWeight;
        for (var _i = 0, weightedNodes_1 = weightedNodes; _i < weightedNodes_1.length; _i++) {
            var _a = weightedNodes_1[_i], node = _a.node, weight = _a.weight;
            random -= weight;
            if (random <= 0) {
                return node;
            }
        }
        return weightedNodes[0].node;
    };
    ModelLoadBalancer.prototype.updateDistributionMetrics = function (result) {
        this.distributionHistory.push(result);
        if (this.distributionHistory.length > 1000) {
            this.distributionHistory.shift();
        }
        var utilization = this.metrics.nodeUtilization.get(result.nodeId) || 0;
        this.metrics.nodeUtilization.set(result.nodeId, utilization + 1);
        this.metrics.requestCount++;
        if (result.latency) {
            this.metrics.averageLatency = (this.metrics.averageLatency * (this.metrics.requestCount - 1) + result.latency) / this.metrics.requestCount;
        }
        this.metrics.lastDistribution = result.timestamp;
    };
    ModelLoadBalancer.prototype.checkNodeHealth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, _b, nodeId, health, metrics, error_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _i = 0, _a = this.nodeHealth.entries();
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        _b = _a[_i], nodeId = _b[0], health = _b[1];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.metricsService.getNodeMetrics(nodeId)];
                    case 3:
                        metrics = _c.sent();
                        health.metrics = {
                            cpu: metrics.cpu,
                            memory: metrics.memory,
                            requestLoad: metrics.requestCount
                        };
                        health.lastCheck = new Date();
                        // Update status based on metrics
                        health.status = this.determineNodeHealth(health.metrics);
                        this.emit('healthUpdate', {
                            nodeId: nodeId,
                            status: health.status,
                            metrics: health.metrics
                        });
                        return [3 /*break*/, 5];
                    case 4:
                        error_1 = _c.sent();
                        health.status = 'unhealthy';
                        this.handleError("Failed to check health for node ".concat(nodeId), error_1);
                        return [3 /*break*/, 5];
                    case 5:
                        _i++;
                        return [3 /*break*/, 1];
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    ModelLoadBalancer.prototype.determineNodeHealth = function (metrics) {
        if (metrics.cpu > 90 || metrics.memory > 90) {
            return 'unhealthy';
        }
        if (metrics.cpu > 70 || metrics.memory > 70) {
            return 'degraded';
        }
        return 'healthy';
    };
    ModelLoadBalancer.prototype.registerNode = function (nodeId) {
        return __awaiter(this, void 0, void 0, function () {
            var health;
            return __generator(this, function (_a) {
                try {
                    health = {
                        nodeId: nodeId,
                        status: 'healthy',
                        lastCheck: new Date(),
                        metrics: {
                            cpu: 0,
                            memory: 0,
                            requestLoad: 0
                        }
                    };
                    this.nodeHealth.set(nodeId, health);
                    this.metrics.nodeUtilization.set(nodeId, 0);
                    this.emit('nodeRegistered', { nodeId: nodeId });
                    this.logNodeEvent(nodeId, 'Node registered');
                }
                catch (error) {
                    this.handleError("Failed to register node ".concat(nodeId), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelLoadBalancer.prototype.unregisterNode = function (nodeId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                try {
                    this.nodeHealth.delete(nodeId);
                    this.metrics.nodeUtilization.delete(nodeId);
                    this.emit('nodeUnregistered', { nodeId: nodeId });
                    this.logNodeEvent(nodeId, 'Node unregistered');
                }
                catch (error) {
                    this.handleError("Failed to unregister node ".concat(nodeId), error);
                    throw error;
                }
                return [2 /*return*/];
            });
        });
    };
    ModelLoadBalancer.prototype.getNodeStats = function (nodeId) {
        var nodeHistory = this.distributionHistory.filter(function (r) { return r.nodeId === nodeId; });
        var successCount = nodeHistory.filter(function (r) { return r.success; }).length;
        var totalRequests = nodeHistory.length;
        return {
            successRate: totalRequests > 0 ? successCount / totalRequests : 1,
            averageLatency: nodeHistory.reduce(function (sum, r) { return sum + (r.latency || 0); }, 0) / totalRequests,
            requestCount: totalRequests
        };
    };
    ModelLoadBalancer.prototype.getLoadBalancerMetrics = function () {
        return __assign({}, this.metrics);
    };
    ModelLoadBalancer.prototype.getNodeHealthStatus = function () {
        return new Map(this.nodeHealth);
    };
    ModelLoadBalancer.prototype.dispose = function () {
        clearInterval(this.healthCheckInterval);
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.nodeHealth.clear();
        this.distributionHistory.length = 0;
    };
    ModelLoadBalancer.prototype.logNodeEvent = function (nodeId, message) {
        var timestamp = new Date().toISOString();
        this.outputChannel.appendLine("[".concat(timestamp, "] Node ").concat(nodeId, ": ").concat(message));
    };
    ModelLoadBalancer.prototype.handleError = function (message, error) {
        this.logger.error('[ModelLoadBalancer]', message, error);
        this.metrics.errorCount++;
        this.emit('error', error);
        this.outputChannel.appendLine("\nError: ".concat(message));
        this.outputChannel.appendLine(error.stack || error.message);
    };
    var _a;
    ModelLoadBalancer = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
        __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
        __param(2, (0, inversify_1.inject)(ModelHostManager_1.ModelHostManager)),
        __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService,
            ModelHostManager_1.ModelHostManager])
    ], ModelLoadBalancer);
    return ModelLoadBalancer;
}(events_1.EventEmitter));
exports.ModelLoadBalancer = ModelLoadBalancer;
