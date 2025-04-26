import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { EventEmitter } from 'events';
import { ModelScalingMetricsService, ScalingMetrics } from './ModelScalingMetricsService';
import { ModelScalingPolicy, ScalingDecision } from './ModelScalingPolicy';
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

@injectable()
export class ModelScalingService extends EventEmitter {
    private activeOperations = new Map<string, ScalingOperation>();
    private operationHistory = new Map<string, ScalingOperation[]>();
    private readonly operationHistoryLimit = 50;
    private readonly automaticScalingEnabled = true;
    private intervalId: NodeJS.Timer | null = null;
    private readonly checkInterval = 60 * 1000; // 1 minute

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelScalingMetricsService) private readonly metricsService: ModelScalingMetricsService,
        @inject(ModelScalingPolicy) private readonly scalingPolicy: ModelScalingPolicy,
        @inject(ModelDeploymentService) private readonly deploymentService: ModelDeploymentService,
        @inject(ModelScalingDashboardService) private readonly dashboardService: ModelScalingDashboardService
    ) {
        super();
        this.logger.info('ModelScalingService initialized');
        
        // Subscribe to metrics updates
        this.metricsService.on('metricsCollected', this.handleMetricsCollected.bind(this));
        
        // Start automatic scaling check if enabled
        if (this.automaticScalingEnabled) {
            this.startAutomaticScaling();
        }
    }

    /**
     * Start the automatic scaling check process
     */
    public startAutomaticScaling(): void {
        if (this.intervalId) {
            return;
        }

        this.intervalId = setInterval(() => this.checkScalingConditions(), this.checkInterval);
        this.logger.info('Automatic scaling check started');
        this.emit('scaling.automatic.started');
    }

    /**
     * Stop the automatic scaling check process
     */
    public stopAutomaticScaling(): void {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
            this.logger.info('Automatic scaling check stopped');
            this.emit('scaling.automatic.stopped');
        }
    }

    /**
     * Handle incoming metrics and potentially trigger scaling
     */
    private handleMetricsCollected(event: { modelId: string, metrics: ScalingMetrics }): void {
        const { modelId, metrics } = event;
        
        // Only process if automatic scaling is enabled
        if (this.automaticScalingEnabled) {
            this.evaluateAndScale(modelId, metrics);
        }
        
        // Update dashboard with the latest metrics
        this.dashboardService.updateModelMetrics(modelId, metrics);
    }

    /**
     * Check scaling conditions for all models with recent metrics
     */
    private async checkScalingConditions(): Promise<void> {
        try {
            const metricsMap = await this.metricsService.getLatestMetrics();
            
            for (const [modelId, metrics] of metricsMap.entries()) {
                await this.evaluateAndScale(modelId, metrics);
            }
        } catch (error) {
            this.logger.error('Error checking scaling conditions', error);
        }
    }

    /**
     * Evaluate scaling decision and execute if needed
     */
    private async evaluateAndScale(modelId: string, metrics: ScalingMetrics): Promise<void> {
        try {
            // Skip if there's already an active scaling operation for this model
            if (this.hasActiveOperation(modelId)) {
                return;
            }
            
            // Get scaling decision
            const decision = this.scalingPolicy.evaluateScalingDecision(modelId, metrics);
            
            // Only proceed if action is required
            if (decision.action === 'no_action') {
                return;
            }
            
            // Execute the scaling operation
            await this.executeScalingOperation(decision);
        } catch (error) {
            this.logger.error(`Error in evaluate and scale for model ${modelId}`, error);
        }
    }

    /**
     * Execute a scaling operation based on a decision
     */
    private async executeScalingOperation(decision: ScalingDecision): Promise<ScalingOperation> {
        const { modelId, action, reason, metrics, replicas = 1 } = decision;
        
        try {
            // Get current deployment info
            const deployment = await this.deploymentService.getModelDeployment(modelId);
            
            if (!deployment) {
                throw new Error(`No deployment found for model ${modelId}`);
            }
            
            // Calculate target replicas
            const currentReplicas = deployment.replicas;
            let targetReplicas = currentReplicas;
            
            if (action === 'scale_up') {
                targetReplicas = currentReplicas + replicas;
            } else if (action === 'scale_down') {
                targetReplicas = Math.max(1, currentReplicas - replicas);
            }
            
            // If no change needed, skip
            if (targetReplicas === currentReplicas) {
                return this.createOperation({
                    modelId,
                    action,
                    status: 'completed',
                    currentReplicas,
                    targetReplicas,
                    reason: `${reason} (No change needed)`,
                    metrics
                });
            }
            
            // Create and record operation
            const operation = this.createOperation({
                modelId,
                action,
                status: 'pending',
                currentReplicas,
                targetReplicas,
                reason,
                metrics
            });
            
            this.recordOperation(operation);
            
            // Update status
            operation.status = 'in_progress';
            this.emit('scaling.started', { operation });
            
            // Execute the scaling through deployment service
            await this.deploymentService.scaleModelDeployment(modelId, targetReplicas);
            
            // Mark as completed
            operation.status = 'completed';
            operation.completedAt = Date.now();
            
            this.emit('scaling.completed', { operation });
            this.logger.info(`Scaling operation completed for model ${modelId}`, operation);
            
            // Update dashboard
            this.dashboardService.addScalingEvent(operation);
            
            return operation;
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            
            // Create failed operation record
            const operation = this.createOperation({
                modelId,
                action,
                status: 'failed',
                currentReplicas: 0, // Will be updated if available
                targetReplicas: 0,  // Will be updated if available
                reason,
                error: errorMessage,
                metrics
            });
            
            // Try to get current deployment info
            try {
                const deployment = await this.deploymentService.getModelDeployment(modelId);
                if (deployment) {
                    operation.currentReplicas = deployment.replicas;
                    operation.targetReplicas = deployment.replicas + (action === 'scale_up' ? replicas : -replicas);
                }
            } catch (deployError) {
                // Ignore secondary errors
            }
            
            this.recordOperation(operation);
            this.emit('scaling.failed', { operation, error });
            this.logger.error(`Scaling operation failed for model ${modelId}`, { operation, error });
            
            // Update dashboard
            this.dashboardService.addScalingEvent(operation);
            
            return operation;
        }
    }

    /**
     * Check if there's an active scaling operation for a model
     */
    private hasActiveOperation(modelId: string): boolean {
        for (const operation of this.activeOperations.values()) {
            if (operation.modelId === modelId && 
                (operation.status === 'pending' || operation.status === 'in_progress')) {
                return true;
            }
        }
        return false;
    }

    /**
     * Create a new scaling operation object
     */
    private createOperation(params: {
        modelId: string;
        action: 'scale_up' | 'scale_down';
        status: 'pending' | 'in_progress' | 'completed' | 'failed';
        currentReplicas: number;
        targetReplicas: number;
        reason: string;
        metrics?: ScalingMetrics;
        error?: string;
    }): ScalingOperation {
        const operationId = `${params.modelId}-${Date.now()}`;
        
        return {
            id: operationId,
            modelId: params.modelId,
            timestamp: new Date(),
            status: params.status,
            action: params.action,
            currentReplicas: params.currentReplicas,
            targetReplicas: params.targetReplicas,
            reason: params.reason,
            metrics: params.metrics,
            error: params.error
        };
    }

    /**
     * Record a scaling operation
     */
    private recordOperation(operation: ScalingOperation): void {
        // Store in active operations if not completed/failed
        if (operation.status === 'pending' || operation.status === 'in_progress') {
            this.activeOperations.set(operation.id, operation);
        } else {
            // Remove from active operations if it was there
            this.activeOperations.delete(operation.id);
        }
        
        // Add to history
        if (!this.operationHistory.has(operation.modelId)) {
            this.operationHistory.set(operation.modelId, []);
        }
        
        const history = this.operationHistory.get(operation.modelId)!;
        history.push(operation);
        
        // Limit history size
        if (history.length > this.operationHistoryLimit) {
            history.shift();
        }
    }

    /**
     * Manually trigger scaling for a model
     */
    public async scaleModel(
        modelId: string,
        replicas: number,
        reason: string = 'Manual scaling'
    ): Promise<ScalingOperation> {
        try {
            this.logger.info(`Manual scaling requested for model ${modelId} to ${replicas} replicas`);
            
            // Get current deployment info
            const deployment = await this.deploymentService.getModelDeployment(modelId);
            
            if (!deployment) {
                throw new Error(`No deployment found for model ${modelId}`);
            }
            
            const currentReplicas = deployment.replicas;
            
            // Determine action
            const action = replicas > currentReplicas ? 'scale_up' : 'scale_down';
            
            // Create and record operation
            const operation = this.createOperation({
                modelId,
                action,
                status: 'pending',
                currentReplicas,
                targetReplicas: replicas,
                reason: `Manual scaling: ${reason}`
            });
            
            this.recordOperation(operation);
            
            // Update status
            operation.status = 'in_progress';
            this.emit('scaling.started', { operation });
            
            // Execute the scaling through deployment service
            await this.deploymentService.scaleModelDeployment(modelId, replicas);
            
            // Mark as completed
            operation.status = 'completed';
            operation.completedAt = Date.now();
            
            this.emit('scaling.completed', { operation });
            this.logger.info(`Manual scaling operation completed for model ${modelId}`, operation);
            
            // Update dashboard
            this.dashboardService.addScalingEvent(operation);
            
            return operation;
        } catch (error) {
            this.logger.error(`Manual scaling operation failed for model ${modelId}`, error);
            throw error;
        }
    }

    /**
     * Get scaling operation history for a model
     */
    public getScalingHistory(modelId: string): ScalingOperation[] {
        return this.operationHistory.get(modelId) || [];
    }

    /**
     * Get all active scaling operations
     */
    public getActiveOperations(): ScalingOperation[] {
        return Array.from(this.activeOperations.values());
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.stopAutomaticScaling();
        this.removeAllListeners();
        this.activeOperations.clear();
        this.operationHistory.clear();
        this.logger.info('ModelScalingService disposed');
    }
}
