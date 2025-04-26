import { injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ScalingMetrics } from './ModelScalingMetricsService';
import { EventEmitter } from 'events';

export interface ScalingThresholds {
    cpuUtilizationHigh: number;  // percentage, e.g., 80
    cpuUtilizationLow: number;   // percentage, e.g., 20
    memoryUtilizationHigh: number;  // percentage, e.g., 80
    memoryUtilizationLow: number;   // percentage, e.g., 20
    queueLengthHigh: number;     // number of requests, e.g., 50
    queueLengthLow: number;      // number of requests, e.g., 5
    latencyHigh: number;         // milliseconds, e.g., 1000
    lastTriggeredTime?: number;
    replicas?: number;
    resources?: {
        cpu?: string;
        memory?: string;
    };
}

export interface ScalingRule {
    name: string;
    description: string;
    condition: (metrics: ScalingMetrics) => boolean;
    action: 'scale_up' | 'scale_down' | 'no_action';
    priority: number; // Higher numbers have higher priority
    cooldownPeriod: number; // milliseconds
    lastTriggeredTime?: number;
    replicas?: number;
    resources?: {
        cpu?: string;
        memory?: string;
    };
}

export interface ScalingDecision {
    modelId: string;
    timestamp: number;
    action: 'scale_up' | 'scale_down' | 'no_action';
    reason: string;
    metrics: ScalingMetrics;
    rule?: ScalingRule;
    replicas?: number;
    resources: {
        cpu?: string;
        memory?: string;
    } | undefined;
}

@injectable()
export class ModelScalingPolicy extends EventEmitter {
    private scalingRules = new Map<string, ScalingRule[]>();
    private recentDecisions = new Map<string, ScalingDecision[]>();
    private readonly decisionHistoryLimit = 20;

    constructor(
        private readonly logger: ILogger
    ) {
        super();
        this.logger.info('ModelScalingPolicy initialized');
        this.initializeDefaultRules();
    }

    private initializeDefaultRules(): void {
        // Define default scaling rules
        const defaultRules: ScalingRule[] = [
            {
                name: 'high-cpu-utilization',
                description: 'Scale up when CPU utilization is high',
                condition: (metrics) => metrics.resources.cpu > 80,
                action: 'scale_up',
                priority: 80,
                cooldownPeriod: 5 * 60 * 1000, // 5 minutes
                replicas: 1
            },
            {
                name: 'high-memory-utilization',
                description: 'Scale up when memory utilization is high',
                condition: (metrics) => metrics.resources.memory > 85,
                action: 'scale_up',
                priority: 85,
                cooldownPeriod: 5 * 60 * 1000, // 5 minutes
                replicas: 1
            },
            {
                name: 'long-response-time',
                description: 'Scale up when response time exceeds threshold',
                condition: (metrics) => metrics.performance.responseTime > 1000,
                action: 'scale_up',
                priority: 90,
                cooldownPeriod: 3 * 60 * 1000, // 3 minutes
                replicas: 1
            },
            {
                name: 'high-queue-length',
                description: 'Scale up when queue length is high',
                condition: (metrics) => metrics.scaling.queueLength > 50,
                action: 'scale_up',
                priority: 95,
                cooldownPeriod: 2 * 60 * 1000, // 2 minutes
                replicas: 1
            },
            {
                name: 'low-cpu-utilization',
                description: 'Scale down when CPU utilization is low',
                condition: (metrics) => metrics.resources.cpu < 20 && metrics.scaling.currentNodes > 1,
                action: 'scale_down',
                priority: 60,
                cooldownPeriod: 15 * 60 * 1000, // 15 minutes
                replicas: 1
            },
            {
                name: 'low-queue-length',
                description: 'Scale down when queue length is low',
                condition: (metrics) => metrics.scaling.queueLength < 5 && metrics.scaling.currentNodes > 1,
                action: 'scale_down',
                priority: 50,
                cooldownPeriod: 10 * 60 * 1000, // 10 minutes
                replicas: 1
            }
        ];

        // Set defaults for all models
        this.scalingRules.set('default', defaultRules);
    }

    /**
     * Add or update scaling rules for a specific model
     */
    public setScalingRules(modelId: string, rules: ScalingRule[]): void {
        this.scalingRules.set(modelId, rules);
        this.logger.info(`Set scaling rules for model ${modelId}`, { rulesCount: rules.length });
        this.emit('rules.updated', { modelId, rules });
    }

    /**
     * Get scaling rules for a model (or default if not set)
     */
    public getScalingRules(modelId: string): ScalingRule[] {
        return this.scalingRules.get(modelId) || this.scalingRules.get('default') || [];
    }

    /**
     * Evaluate metrics against rules to make a scaling decision
     */
    public evaluateScalingDecision(modelId: string, metrics: ScalingMetrics): ScalingDecision {
        try {
            this.logger.info(`Evaluating scaling decision for model ${modelId}`);
            
            const rules = this.getScalingRules(modelId);
            const now = Date.now();
            const applicableRules: ScalingRule[] = [];

            // Find applicable rules that are not in cooldown
            for (const rule of rules) {
                const lastTriggered = rule.lastTriggeredTime || 0;
                const cooldownExpired = (now - lastTriggered) > rule.cooldownPeriod;

                if (cooldownExpired && rule.condition(metrics)) {
                    applicableRules.push(rule);
                }
            }

            if (applicableRules.length === 0) {
                return this.createDecision(modelId, 'no_action', 'No applicable rules', metrics);
            }

            // Sort by priority (highest first)
            applicableRules.sort((a, b) => b.priority - a.priority);
            const selectedRule = applicableRules[0];

            // Update last triggered time
            if (selectedRule) {
                selectedRule.lastTriggeredTime = now;
                
                const decision = this.createDecision(
                    modelId,
                    selectedRule.action,
                    `Rule "${selectedRule.name}" triggered: ${selectedRule.description}`,
                    metrics,
                    selectedRule
                );

                this.recordDecision(decision);
                
                this.logger.info(`Scaling decision for model ${modelId}: ${decision.action}`, {
                    reason: decision.reason,
                    rule: selectedRule.name
                });

                return decision;
            }

            // This should never happen since we check applicableRules.length above,
            // but this satisfies TypeScript's control flow analysis
            return this.createDecision(
                modelId,
                'no_action',
                'No applicable rule selected',
                metrics
            );
        } catch (error) {
            this.logger.error(`Error evaluating scaling decision for model ${modelId}`, error);
            
            // Return a safe default
            return this.createDecision(
                modelId,
                'no_action',
                'Error evaluating scaling rules',
                metrics
            );
        }
    }

    /**
     * Create a scaling decision object
     */
    private createDecision(
        modelId: string,
        action: 'scale_up' | 'scale_down' | 'no_action',
        reason: string,
        metrics: ScalingMetrics,
        rule?: ScalingRule
    ): ScalingDecision {
        return {
            modelId,
            timestamp: new Date(),
            action,
            reason,
            metrics,
            rule,
            replicas: rule?.replicas,
            resources: rule?.resources
        };
    }

    /**
     * Record a scaling decision in history
     */
    private recordDecision(decision: ScalingDecision): void {
        const { modelId } = decision;
        
        if (!this.recentDecisions.has(modelId)) {
            this.recentDecisions.set(modelId, []);
        }

        const decisions = this.recentDecisions.get(modelId)!;
        decisions.push(decision);

        // Limit the history size
        if (decisions.length > this.decisionHistoryLimit) {
            decisions.shift();
        }

        this.emit('decision.made', { decision });
    }

    /**
     * Get recent scaling decisions for a model
     */
    public getRecentDecisions(modelId: string): ScalingDecision[] {
        return this.recentDecisions.get(modelId) || [];
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.removeAllListeners();
        this.scalingRules.clear();
        this.recentDecisions.clear();
        this.logger.info('ModelScalingPolicy disposed');
    }
}
