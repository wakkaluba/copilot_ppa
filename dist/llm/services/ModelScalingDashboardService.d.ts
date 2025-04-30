import { ILogger } from '../../utils/logger';
import { ModelScalingMetricsService } from './ModelScalingMetricsService';
import { EventEmitter } from 'events';
/**
 * Service for displaying scaling metrics in a dashboard
 */
export declare class ModelScalingDashboardService extends EventEmitter {
    private readonly logger;
    private readonly metricsService;
    private dashboardState;
    private subscribedModels;
    private metricsListener;
    constructor(logger: ILogger, metricsService: ModelScalingMetricsService);
    /**
     * Setup event listeners
     */
    private setupListeners;
    /**
     * Show dashboard for a model
     */
    showDashboard(modelId: string): Promise<void>;
    /**
     * Update dashboard with new metrics
     */
    private updateDashboard;
    /**
     * Get current dashboard state
     */
    getDashboard(modelId: string): any;
    /**
     * Close dashboard for a model
     */
    closeDashboard(modelId: string): void;
    /**
     * Dispose of resources
     */
    dispose(): void;
}
