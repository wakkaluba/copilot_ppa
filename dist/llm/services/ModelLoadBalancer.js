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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModelLoadBalancer = void 0;
const vscode = __importStar(require("vscode"));
const inversify_1 = require("inversify");
const events_1 = require("events");
let ModelLoadBalancer = (() => {
    let _classDecorators = [(0, inversify_1.injectable)()];
    let _classDescriptor;
    let _classExtraInitializers = [];
    let _classThis;
    let _classSuper = events_1.EventEmitter;
    var ModelLoadBalancer = class extends _classSuper {
        static { _classThis = this; }
        static {
            const _metadata = typeof Symbol === "function" && Symbol.metadata ? Object.create(_classSuper[Symbol.metadata] ?? null) : void 0;
            __esDecorate(null, _classDescriptor = { value: _classThis }, _classDecorators, { kind: "class", name: _classThis.name, metadata: _metadata }, null, _classExtraInitializers);
            ModelLoadBalancer = _classThis = _classDescriptor.value;
            if (_metadata) Object.defineProperty(_classThis, Symbol.metadata, { enumerable: true, configurable: true, writable: true, value: _metadata });
            __runInitializers(_classThis, _classExtraInitializers);
        }
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
    return ModelLoadBalancer = _classThis;
})();
exports.ModelLoadBalancer = ModelLoadBalancer;
//# sourceMappingURL=ModelLoadBalancer.js.map