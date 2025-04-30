import { ILogger } from '../../utils/logger';
import { ScalingMetrics } from './ModelScalingMetricsService';
import { EventEmitter } from 'events';
export interface ScalingThresholds {
    cpuUtilizationHigh: number;
    cpuUtilizationLow: number;
    memoryUtilizationHigh: number;
    memoryUtilizationLow: number;
    queueLengthHigh: number;
    queueLengthLow: number;
    latencyHigh: number;
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
    priority: number;
    cooldownPeriod: number;
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
export declare class ModelScalingPolicy extends EventEmitter {
    private readonly logger;
    private scalingRules;
    private recentDecisions;
    private readonly decisionHistoryLimit;
    constructor(logger: ILogger);
    private initializeDefaultRules;
    /**
     * Add or update scaling rules for a specific model
     */
    setScalingRules(modelId: string, rules: ScalingRule[]): void;
    /**
     * Get scaling rules for a model (or default if not set)
     */
    getScalingRules(modelId: string): ScalingRule[];
    /**
     * Evaluate metrics against rules to make a scaling decision
     */
    evaluateScalingDecision(modelId: string, metrics: ScalingMetrics): ScalingDecision;
    /**
     * Create a scaling decision object
     */
    private createDecision;
    /**
     * Record a scaling decision in history
     */
    private recordDecision;
    /**
     * Get recent scaling decisions for a model
     */
    getRecentDecisions(modelId: string): ScalingDecision[];
    /**
     * Dispose of resources
     */
    dispose(): void;
}
