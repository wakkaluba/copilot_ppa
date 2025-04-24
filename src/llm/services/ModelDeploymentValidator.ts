import { inject, injectable } from 'inversify';
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

@injectable()
export class ModelDeploymentValidator extends EventEmitter {
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelHealthMonitor) private readonly healthMonitor: ModelHealthMonitor,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
    }

    public async validateDeployment(modelId: string, config: ValidationConfig): Promise<DeploymentValidationResult> {
        try {
            const healthStatus = await this.healthMonitor.getSystemHealth();
            const metrics = await this.metricsService.getLatestMetrics();
            const modelMetrics = metrics.get(modelId);

            const result: DeploymentValidationResult = {
                isValid: true,
                issues: [],
                warnings: [],
                recommendations: []
            };

            // Validate health score
            if (healthStatus.healthScore < config.minHealthScore) {
                result.issues.push(`Health score ${healthStatus.healthScore} below minimum ${config.minHealthScore}`);
                result.isValid = false;
            }

            // Validate error rate
            if (modelMetrics?.errorRate > config.maxErrorRate) {
                result.issues.push(`Error rate ${modelMetrics.errorRate} exceeds maximum ${config.maxErrorRate}`);
                result.isValid = false;
            }

            // Validate availability
            if (modelMetrics?.availability < config.minAvailability) {
                result.issues.push(`Availability ${modelMetrics.availability} below minimum ${config.minAvailability}`);
                result.isValid = false;
            }

            // Resource utilization warnings
            this.validateResourceUtilization(modelMetrics?.resourceUtilization, config.resourceThresholds, result);

            this.emit('validationComplete', { modelId, result });
            return result;
        } catch (error) {
            this.handleError('Deployment validation failed', error);
            throw error;
        }
    }

    private validateResourceUtilization(
        current: { cpu: number; memory: number; gpu?: number } | undefined,
        thresholds: { cpu: number; memory: number; gpu?: number },
        result: DeploymentValidationResult
    ): void {
        if (!current) return;

        if (current.cpu > thresholds.cpu) {
            result.warnings.push(`High CPU utilization: ${current.cpu}%`);
            result.recommendations.push('Consider scaling CPU resources');
        }

        if (current.memory > thresholds.memory) {
            result.warnings.push(`High memory utilization: ${current.memory}%`);
            result.recommendations.push('Consider scaling memory resources');
        }

        if (current.gpu && thresholds.gpu && current.gpu > thresholds.gpu) {
            result.warnings.push(`High GPU utilization: ${current.gpu}%`);
            result.recommendations.push('Consider scaling GPU resources');
        }
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
}
