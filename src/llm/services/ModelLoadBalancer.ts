import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../common/logging';
import { ModelMetricsService } from './ModelMetricsService';
import { ModelHostManager } from './ModelHostManager';

interface LoadBalancerMetrics {
    requestCount: number;
    errorCount: number;
    averageLatency: number;
    nodeUtilization: Map<string, number>;
    lastDistribution: Date;
}

interface NodeHealth {
    nodeId: string;
    status: 'healthy' | 'degraded' | 'unhealthy';
    lastCheck: Date;
    metrics: {
        cpu: number;
        memory: number;
        requestLoad: number;
        latency?: number;
        errorRate?: number;
    };
}

interface NodeDistributionResult {
    nodeId: string;
    success: boolean;
    timestamp: Date;
    latency?: number;
    error?: string;
}

@injectable()
export class ModelLoadBalancer extends EventEmitter implements vscode.Disposable {
    private readonly metrics: LoadBalancerMetrics;
    private readonly nodeHealth = new Map<string, NodeHealth>();
    private readonly outputChannel: vscode.OutputChannel;
    private readonly healthCheckInterval: NodeJS.Timer;
    private readonly distributionHistory: NodeDistributionResult[] = [];

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService,
        @inject(ModelHostManager) private readonly hostManager: ModelHostManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Load Balancer');
        this.metrics = this.initializeMetrics();
        this.startMonitoring();
    }

    private startMonitoring(): void {
        this.healthCheckInterval = setInterval(() => this.checkNodeHealth(), 30000);
        this.emit('monitoringStarted');
        this.logger.info('Load balancer monitoring started');
    }

    public async distributeRequest(requestId: string, modelId: string): Promise<string> {
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

            const result: NodeDistributionResult = {
                nodeId: selectedNode.nodeId,
                success: true,
                timestamp: new Date(),
                latency: Date.now() - startTime
            };

            this.updateDistributionMetrics(result);
            this.emit('requestDistributed', { requestId, nodeId: selectedNode.nodeId });
            
            return selectedNode.nodeId;
        } catch (error) {
            this.handleError('Failed to distribute request', error as Error);
            throw error;
        }
    }

    private selectNode(nodes: [string, NodeHealth][], requestId: string): NodeHealth | undefined {
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

    private calculateNodeWeight(node: NodeHealth): number {
        const cpuScore = 1 - (node.metrics.cpu / 100);
        const memoryScore = 1 - (node.metrics.memory / 100);
        const loadScore = 1 - (node.metrics.requestLoad / 100);
        
        // Consider latency if available
        const latencyScore = node.metrics.latency 
            ? 1 - Math.min(node.metrics.latency / 1000, 1)
            : 1;

        return (cpuScore * 0.3 + memoryScore * 0.3 + loadScore * 0.2 + latencyScore * 0.2);
    }

    private selectWeightedNode(weightedNodes: Array<{ node: NodeHealth; weight: number }>): NodeHealth {
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

    private updateDistributionMetrics(result: NodeDistributionResult): void {
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

    private async checkNodeHealth(): Promise<void> {
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
            } catch (error) {
                health.status = 'unhealthy';
                this.handleError(`Failed to check health for node ${nodeId}`, error as Error);
            }
        }
    }

    private determineNodeHealth(metrics: { cpu: number; memory: number; requestLoad: number }): 'healthy' | 'degraded' | 'unhealthy' {
        if (metrics.cpu > 90 || metrics.memory > 90) {
            return 'unhealthy';
        }
        if (metrics.cpu > 70 || metrics.memory > 70) {
            return 'degraded';
        }
        return 'healthy';
    }

    public async registerNode(nodeId: string): Promise<void> {
        try {
            const health: NodeHealth = {
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
        } catch (error) {
            this.handleError(`Failed to register node ${nodeId}`, error as Error);
            throw error;
        }
    }

    public async unregisterNode(nodeId: string): Promise<void> {
        try {
            this.nodeHealth.delete(nodeId);
            this.metrics.nodeUtilization.delete(nodeId);

            this.emit('nodeUnregistered', { nodeId });
            this.logNodeEvent(nodeId, 'Node unregistered');
        } catch (error) {
            this.handleError(`Failed to unregister node ${nodeId}`, error as Error);
            throw error;
        }
    }

    private getNodeStats(nodeId: string): {
        successRate: number;
        averageLatency: number;
        requestCount: number;
    } {
        const nodeHistory = this.distributionHistory.filter(r => r.nodeId === nodeId);
        const successCount = nodeHistory.filter(r => r.success).length;
        const totalRequests = nodeHistory.length;
        
        return {
            successRate: totalRequests > 0 ? successCount / totalRequests : 1,
            averageLatency: nodeHistory.reduce((sum, r) => sum + (r.latency || 0), 0) / totalRequests,
            requestCount: totalRequests
        };
    }

    public getLoadBalancerMetrics(): LoadBalancerMetrics {
        return { ...this.metrics };
    }

    public getNodeHealthStatus(): Map<string, NodeHealth> {
        return new Map(this.nodeHealth);
    }

    public dispose(): void {
        clearInterval(this.healthCheckInterval);
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.nodeHealth.clear();
        this.distributionHistory.length = 0;
    }

    private logNodeEvent(nodeId: string, message: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] Node ${nodeId}: ${message}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelLoadBalancer]', message, error);
        this.metrics.errorCount++;
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }
}
