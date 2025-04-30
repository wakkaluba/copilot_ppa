import { ILogger } from '../../utils/logger';
import { EventEmitter } from 'events';
import { ModelScalingMetricsService, ScalingMetrics } from './ModelScalingMetricsService';
import { ModelScalingPolicy } from './ModelScalingPolicy';
import { ModelDeploymentService } from './ModelDeploymentService';
import { ModelScalingDashboardService } from './ModelScalingDashboardService';
export interface ScalingOperation {
    id: string;
    modelId: string;
    timestamp: number;
    status: 'pending' | 'in_progress' | 'completed' | 'failed';
    action: 'scale_up' | 'scale_down';
    currentReplicas: number;
    targetReplicas: number;
    resources?: {
        cpu?: string;
        memory?: string;
    };
    reason: string;
    error?: string;
    metrics?: ScalingMetrics;
    completedAt?: number;
}
export declare class ModelScalingService extends EventEmitter {
    private readonly logger;
    private readonly metricsService;
    private readonly scalingPolicy;
    private readonly deploymentService;
    private readonly dashboardService;
    private activeOperations;
    private operationHistory;
    private readonly operationHistoryLimit;
    private readonly automaticScalingEnabled;
    private intervalId;
    private readonly checkInterval;
    constructor(logger: ILogger, metricsService: ModelScalingMetricsService, scalingPolicy: ModelScalingPolicy, deploymentService: ModelDeploymentService, dashboardService: ModelScalingDashboardService);
    /**
     * Start the automatic scaling check process
     */
    startAutomaticScaling(): void;
    /**
     * Stop the automatic scaling check process
     */
    stopAutomaticScaling(): void;
    /**
     * Handle incoming metrics and potentially trigger scaling
     */
    private handleMetricsCollected;
    /**
     * Check scaling conditions for all models with recent metrics
     */
    private checkScalingConditions;
    /**
     * Evaluate scaling decision and execute if needed
     */
    private evaluateAndScale;
    /**
     * Execute a scaling operation based on a decision
     */
    private executeScalingOperation;
    /**
     * Check if there's an active scaling operation for a model
     */
    private hasActiveOperation;
    /**
     * Create a new scaling operation object
     */
    private createOperation;
    /**
     * Record a scaling operation
     */
    private recordOperation;
    /**
     * Manually trigger scaling for a model
     */
    scaleModel(modelId: string, replicas: number, reason?: string): Promise<ScalingOperation>;
    /**
     * Get scaling operation history for a model
     */
    getScalingHistory(modelId: string): ScalingOperation[];
    /**
     * Get all active scaling operations
     */
    getActiveOperations(): ScalingOperation[];
    /**
     * Dispose of resources
     */
    dispose(): void;
}
