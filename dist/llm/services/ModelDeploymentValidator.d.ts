import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
import { ModelHealthMonitor } from './ModelHealthMonitor';
import { ModelMetricsService } from './ModelMetricsService';
export interface DeploymentValidationResult {
    isValid: boolean;
    issues: string[];
    warnings: string[];
    recommendations: string[];
}
export interface ValidationConfig {
    minHealthScore: number;
    maxErrorRate: number;
    minAvailability: number;
    resourceThresholds: {
        cpu: number;
        memory: number;
        gpu?: number;
    };
}
export declare class ModelDeploymentValidator extends EventEmitter {
    private readonly logger;
    private readonly healthMonitor;
    private readonly metricsService;
    constructor(logger: ILogger, healthMonitor: ModelHealthMonitor, metricsService: ModelMetricsService);
    validateDeployment(modelId: string, config: ValidationConfig): Promise<DeploymentValidationResult>;
    private validateResourceUtilization;
    private handleError;
}
