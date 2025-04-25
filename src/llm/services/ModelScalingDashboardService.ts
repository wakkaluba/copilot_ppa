import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ModelScalingMetricsService, ScalingMetrics } from './ModelScalingMetricsService';
import { EventEmitter } from 'events';

/**
 * Service for displaying scaling metrics in a dashboard
 */
@injectable()
export class ModelScalingDashboardService extends EventEmitter {
    private dashboardState = new Map<string, any>();
    private subscribedModels = new Set<string>();
    private metricsListener: any;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelScalingMetricsService) private readonly metricsService: ModelScalingMetricsService
    ) {
        super();
        this.logger.info('ModelScalingDashboardService initialized');
        this.setupListeners();
    }

    /**
     * Setup event listeners
     */
    private setupListeners(): void {
        this.metricsListener = (event: { modelId: string, metrics: ScalingMetrics }) => {
            const { modelId, metrics } = event;
            if (this.subscribedModels.has(modelId)) {
                this.updateDashboard(modelId, metrics);
            }
        };

        this.metricsService.on('metricsCollected', this.metricsListener);
        this.metricsService.on('metricsUpdated', this.metricsListener);
    }

    /**
     * Show dashboard for a model
     */
    public async showDashboard(modelId: string): Promise<void> {
        try {
            this.logger.info(`Showing dashboard for model: ${modelId}`);
            
            // Subscribe to updates for this model
            this.subscribedModels.add(modelId);
            
            // Get initial metrics
            const metrics = this.metricsService.getMetricsHistory(modelId);
            
            // Initialize dashboard
            this.dashboardState.set(modelId, {
                modelId,
                lastUpdated: Date.now(),
                metrics: metrics.length > 0 ? metrics[metrics.length - 1] : null,
                history: metrics
            });
            
            this.emit('dashboardOpened', { modelId });
        } catch (error) {
            this.logger.error(`Error showing dashboard for model ${modelId}`, error);
            throw error;
        }
    }

    /**
     * Update dashboard with new metrics
     */
    private updateDashboard(modelId: string, metrics: ScalingMetrics): void {
        try {
            const dashboard = this.dashboardState.get(modelId) || {
                modelId,
                history: []
            };
            
            // Update dashboard state
            dashboard.lastUpdated = Date.now();
            dashboard.metrics = metrics;
            dashboard.history.push(metrics);
            
            // Cap history length to avoid memory issues
            if (dashboard.history.length > 100) {
                dashboard.history = dashboard.history.slice(-100);
            }
            
            this.dashboardState.set(modelId, dashboard);
            
            this.logger.info(`Dashboard updated for model ${modelId}`, { timestamp: metrics.timestamp });
            this.emit('dashboardUpdated', { modelId, metrics });
        } catch (error) {
            this.logger.error(`Error updating dashboard for model ${modelId}`, error);
        }
    }

    /**
     * Get current dashboard state
     */
    public getDashboard(modelId: string): any {
        return this.dashboardState.get(modelId);
    }

    /**
     * Close dashboard for a model
     */
    public closeDashboard(modelId: string): void {
        this.subscribedModels.delete(modelId);
        this.emit('dashboardClosed', { modelId });
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.metricsService.removeListener('metricsCollected', this.metricsListener);
        this.metricsService.removeListener('metricsUpdated', this.metricsListener);
        this.removeAllListeners();
        this.subscribedModels.clear();
        this.dashboardState.clear();
        this.logger.info('ModelScalingDashboardService disposed');
    }
}
