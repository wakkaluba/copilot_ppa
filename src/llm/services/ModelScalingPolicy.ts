import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
import { ModelHealthMonitor } from './ModelHealthMonitor';
import { ModelMetricsService } from './ModelMetricsService';

export interface ScalingPolicy {
    name: string;
    description: string;
    enabled: boolean;
    rules: ScalingRule[];
    cooldown: number;
    targets: {
        minInstances: number;
        maxInstances: number;
        targetCpuUtilization: number;
        targetMemoryUtilization: number;
        targetResponseTime: number;
    };
}

export interface ScalingRule {
    metric: string;
    operator: 'gt' | 'lt' | 'gte' | 'lte' | 'eq';
    threshold: number;
    scaleChange: number;
    duration: number;
}

@injectable()
export class ModelScalingPolicy extends EventEmitter {
    private readonly policies = new Map<string, ScalingPolicy>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelHealthMonitor) private readonly healthMonitor: ModelHealthMonitor,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
    }

    public async createPolicy(modelId: string, policy: ScalingPolicy): Promise<void> {
        try {
            await this.validatePolicy(policy);
            this.policies.set(modelId, policy);
            this.emit('policyCreated', { modelId, policy });
        } catch (error) {
            this.handleError('Failed to create scaling policy', error);
            throw error;
        }
    }

    public async evaluatePolicy(modelId: string): Promise<ScalingDecision | null> {
        try {
            const policy = this.policies.get(modelId);
            if (!policy || !policy.enabled) return null;

            const metrics = await this.metricsService.getLatestMetrics();
            const modelMetrics = metrics.get(modelId);
            if (!modelMetrics) return null;

            const decision = this.evaluateRules(policy, modelMetrics);
            if (decision) {
                this.emit('scalingDecision', { modelId, decision });
            }
            return decision;
        } catch (error) {
            this.handleError('Failed to evaluate scaling policy', error);
            return null;
        }
    }

    private evaluateRules(policy: ScalingPolicy, metrics: any): ScalingDecision | null {
        for (const rule of policy.rules) {
            const metricValue = this.getMetricValue(metrics, rule.metric);
            if (this.evaluateCondition(metricValue, rule.operator, rule.threshold)) {
                return {
                    scaleChange: rule.scaleChange,
                    reason: `${rule.metric} ${rule.operator} ${rule.threshold}`,
                    metrics: metrics,
                    timestamp: Date.now()
                };
            }
        }
        return null;
    }

    private getMetricValue(metrics: any, metricPath: string): number {
        return metricPath.split('.').reduce((obj, key) => obj?.[key], metrics) || 0;
    }

    private evaluateCondition(value: number, operator: string, threshold: number): boolean {
        switch (operator) {
            case 'gt': return value > threshold;
            case 'lt': return value < threshold;
            case 'gte': return value >= threshold;
            case 'lte': return value <= threshold;
            case 'eq': return value === threshold;
            default: return false;
        }
    }

    private async validatePolicy(policy: ScalingPolicy): Promise<void> {
        if (!policy.name || !policy.rules || policy.rules.length === 0) {
            throw new Error('Invalid policy configuration');
        }

        if (policy.targets.minInstances < 0 || policy.targets.maxInstances < policy.targets.minInstances) {
            throw new Error('Invalid instance limits');
        }

        for (const rule of policy.rules) {
            if (!rule.metric || !rule.operator || rule.threshold === undefined) {
                throw new Error('Invalid rule configuration');
            }
        }
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }

    public getPolicy(modelId: string): ScalingPolicy | undefined {
        return this.policies.get(modelId);
    }

    public getAllPolicies(): Map<string, ScalingPolicy> {
        return new Map(this.policies);
    }

    public async updatePolicy(modelId: string, updates: Partial<ScalingPolicy>): Promise<void> {
        const existing = this.policies.get(modelId);
        if (!existing) {
            throw new Error(`No policy found for model ${modelId}`);
        }

        const updated = { ...existing, ...updates };
        await this.validatePolicy(updated);
        this.policies.set(modelId, updated);
        this.emit('policyUpdated', { modelId, policy: updated });
    }
}
