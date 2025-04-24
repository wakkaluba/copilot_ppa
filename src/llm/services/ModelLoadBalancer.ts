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
    };
}

@injectable()
export class ModelLoadBalancer extends EventEmitter implements vscode.Disposable {
    private readonly metrics: LoadBalancerMetrics;
    private readonly nodeHealth = new Map<string, NodeHealth>();
    private readonly outputChannel: vscode.OutputChannel;
    private readonly healthCheckInterval: NodeJS.Timer;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService,
        @inject(ModelHostManager) private readonly hostManager: ModelHostManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Load Balancer');
        this.metrics = this.initializeMetrics();
        this.healthCheckInterval = setInterval(() => this.checkNodeHealth(), 30000);
    }

    private initializeMetrics(): LoadBalancerMetrics {
        return {
            requestCount: 0,
            errorCount: 0,
            averageLatency: 0,
            nodeUtilization: new Map(),
            lastDistribution: new Date()
        };
    }

    public async distributeRequest(requestId: string, modelId: string): Promise<string> {
        try {
            const nodes = Array.from(this.nodeHealth.entries());
            if (nodes.length === 0) {
                throw new Error('No available nodes for request distribution');
            }

            // Select best node based on health and load
            const selectedNode = this.selectOptimalNode(nodes);
            if (!selectedNode) {
                throw new Error('No healthy nodes available');
            }

            this.updateMetrics(selectedNode.nodeId);
            this.logDistribution(requestId, selectedNode.nodeId);

            return selectedNode.nodeId;
        } catch (error) {
            this.handleError('Failed to distribute request', error as Error);
            throw error;
        }
    }

    private selectOptimalNode(nodes: [string, NodeHealth][]): NodeHealth | undefined {
        const healthyNodes = nodes.filter(([_, health]) => health.status === 'healthy');
        if (healthyNodes.length === 0) {
            return undefined;
        }

        // Sort by load and health metrics
        return healthyNodes.sort(([_, a], [__, b]) => {
            const aScore = this.calculateNodeScore(a);
            const bScore = this.calculateNodeScore(b);
            return aScore - bScore;
        })[0][1];
    }

    private calculateNodeScore(node: NodeHealth): number {
        const cpuWeight = 0.4;
        const memoryWeight = 0.3;
        const loadWeight = 0.3;

        return (node.metrics.cpu * cpuWeight) +
               (node.metrics.memory * memoryWeight) +
               (node.metrics.requestLoad * loadWeight);
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

    private updateMetrics(nodeId: string): void {
        this.metrics.requestCount++;
        const utilization = this.metrics.nodeUtilization.get(nodeId) || 0;
        this.metrics.nodeUtilization.set(nodeId, utilization + 1);
        this.metrics.lastDistribution = new Date();
    }

    private logDistribution(requestId: string, nodeId: string): void {
        const timestamp = new Date().toISOString();
        this.outputChannel.appendLine(`[${timestamp}] Request ${requestId} distributed to node ${nodeId}`);
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

    public dispose(): void {
        clearInterval(this.healthCheckInterval);
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.nodeHealth.clear();
    }
}
