"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLoadBalancer = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
const logging_1 = require("../../common/logging");
const ModelMetricsService_1 = require("./ModelMetricsService");
const ModelHostManager_1 = require("./ModelHostManager");
let ModelLoadBalancer = class ModelLoadBalancer extends events_1.EventEmitter {
    logger;
    metricsService;
    hostManager;
    metrics;
    nodeHealth = new Map();
    outputChannel;
    healthCheckInterval;
    distributionHistory = [];
    constructor(logger, metricsService, hostManager) {
        super();
        this.logger = logger;
        this.metricsService = metricsService;
        this.hostManager = hostManager;
        this.outputChannel = vscode.window.createOutputChannel('Model Load Balancer');
        this.metrics = this.initializeMetrics();
        this.startMonitoring();
    }
    startMonitoring() {
        this.healthCheckInterval = setInterval(() => this.checkNodeHealth(), 30000);
        this.emit('monitoringStarted');
        this.logger.info('Load balancer monitoring started');
    }
    async distributeRequest(requestId, modelId) {
        try {
            const startTime = Date.now();
            const nodes = Array.from(this.nodeHealth.entries());
            if (nodes.length === 0) {
                throw new Error('No available nodes for request distribution');
            }
            const selectedNode = this.selectNode(nodes, requestId);
            if (!selectedNode) {
                throw new Error('No healthy nodes available');
            }
            const result = {
                nodeId: selectedNode.nodeId,
                success: true,
                timestamp: new Date(),
                latency: Date.now() - startTime
            };
            this.updateDistributionMetrics(result);
            this.emit('requestDistributed', { requestId, nodeId: selectedNode.nodeId });
            return selectedNode.nodeId;
        }
        catch (error) {
            this.handleError('Failed to distribute request', error);
            throw error;
        }
    }
    selectNode(nodes, requestId) {
        const healthyNodes = nodes.filter(([_, health]) => health.status === 'healthy');
        if (healthyNodes.length === 0) {
            return undefined;
        }
        // Use weighted round-robin with health scores
        const weightedNodes = healthyNodes.map(([_, node]) => ({
            node,
            weight: this.calculateNodeWeight(node)
        }));
        return this.selectWeightedNode(weightedNodes);
    }
    calculateNodeWeight(node) {
        const cpuScore = 1 - (node.metrics.cpu / 100);
        const memoryScore = 1 - (node.metrics.memory / 100);
        const loadScore = 1 - (node.metrics.requestLoad / 100);
        // Consider latency if available
        const latencyScore = node.metrics.latency
            ? 1 - Math.min(node.metrics.latency / 1000, 1)
            : 1;
        return (cpuScore * 0.3 + memoryScore * 0.3 + loadScore * 0.2 + latencyScore * 0.2);
    }
    selectWeightedNode(weightedNodes) {
        const totalWeight = weightedNodes.reduce((sum, { weight }) => sum + weight, 0);
        let random = Math.random() * totalWeight;
        for (const { node, weight } of weightedNodes) {
            random -= weight;
            if (random <= 0) {
                return node;
            }
        }
        return weightedNodes[0].node;
    }
    updateDistributionMetrics(result) {
        this.distributionHistory.push(result);
        if (this.distributionHistory.length > 1000) {
            this.distributionHistory.shift();
        }
        const utilization = this.metrics.nodeUtilization.get(result.nodeId) || 0;
        this.metrics.nodeUtilization.set(result.nodeId, utilization + 1);
        this.metrics.requestCount++;
        if (result.latency) {
            this.metrics.averageLatency = (this.metrics.averageLatency * (this.metrics.requestCount - 1) + result.latency) / this.metrics.requestCount;
        }
        this.metrics.lastDistribution = result.timestamp;
    }
    async checkNodeHealth() {
        for (const [nodeId, health] of this.nodeHealth.entries()) {
            try {
                const metrics = await this.metricsService.getNodeMetrics(nodeId);
                health.metrics = {
                    cpu: metrics.cpu,
                    memory: metrics.memory,
                    requestLoad: metrics.requestCount
                };
                health.lastCheck = new Date();
                // Update status based on metrics
                health.status = this.determineNodeHealth(health.metrics);
                this.emit('healthUpdate', {
                    nodeId,
                    status: health.status,
                    metrics: health.metrics
                });
            }
            catch (error) {
                health.status = 'unhealthy';
                this.handleError(`Failed to check health for node ${nodeId}`, error);
            }
        }
    }
    determineNodeHealth(metrics) {
        if (metrics.cpu > 90 || metrics.memory > 90) {
            return 'unhealthy';
        }
        if (metrics.cpu > 70 || metrics.memory > 70) {
            return 'degraded';
        }
        return 'healthy';
    }
    async registerNode(nodeId) {
        try {
            const health = {
                nodeId,
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
            this.emit('nodeRegistered', { nodeId });
            this.logNodeEvent(nodeId, 'Node registered');
        }
        catch (error) {
            this.handleError(`Failed to register node ${nodeId}`, error);
            throw error;
        }
    }
    async unregisterNode(nodeId) {
        try {
            this.nodeHealth.delete(nodeId);
            this.metrics.nodeUtilization.delete(nodeId);
            this.emit('nodeUnregistered', { nodeId });
            this.logNodeEvent(nodeId, 'Node unregistered');
        }
        catch (error) {
            this.handleError(`Failed to unregister node ${nodeId}`, error);
            throw error;
        }
    }
    getNodeStats(nodeId) {
        const nodeHistory = this.distributionHistory.filter(r => r.nodeId === nodeId);
        const successCount = nodeHistory.filter(r => r.success).length;
        const totalRequests = nodeHistory.length;
        return {
            successRate: totalRequests > 0 ? successCount / totalRequests : 1,
            averageLatency: nodeHistory.reduce((sum, r) => sum + (r.latency || 0), 0) / totalRequests,
            requestCount: totalRequests
        };
    }
    getLoadBalancerMetrics() {
        return { ...this.metrics };
    }
    getNodeHealthStatus() {
        return new Map(this.nodeHealth);
    }
    dispose() {
        clearInterval(this.healthCheckInterval);
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.nodeHealth.clear();
        this.distributionHistory.length = 0;
    }
    logNodeEvent(nodeId, message) {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] Node ${nodeId}: ${message}`);
    }
    handleError(message, error) {
        this.logger.error('[ModelLoadBalancer]', message, error);
        this.metrics.errorCount++;
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
};
exports.ModelLoadBalancer = ModelLoadBalancer;
exports.ModelLoadBalancer = ModelLoadBalancer = __decorate([
    (0, inversify_1.injectable)(),
    __param(0, (0, inversify_1.inject)(logging_1.ILogger)),
    __param(1, (0, inversify_1.inject)(ModelMetricsService_1.ModelMetricsService)),
    __param(2, (0, inversify_1.inject)(ModelHostManager_1.ModelHostManager)),
    __metadata("design:paramtypes", [typeof (_a = typeof logging_1.ILogger !== "undefined" && logging_1.ILogger) === "function" ? _a : Object, ModelMetricsService_1.ModelMetricsService,
        ModelHostManager_1.ModelHostManager])
], ModelLoadBalancer);
//# sourceMappingURL=ModelLoadBalancer.js.map