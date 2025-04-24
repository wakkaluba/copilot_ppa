import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../../utils/logger';
import { ModelHealthMonitorV2 } from './ModelHealthMonitorV2';
import { ModelMetricsService } from './ModelMetricsService';

export interface ValidationConfig {
    preScaleValidation: boolean;
    postScaleValidation: boolean;
    healthCheckTimeout: number;
    metricThresholds: {
        maxErrorRate: number;
        minAvailability: number;
        maxLatency: number;
    };
}

export interface ValidationResult {
    isValid: boolean;
    issues: string[];
    metrics: {
        errorRate: number;
        availability: number;
        latency: number;
        resourceUtilization: number;
    };
}

export interface RollbackConfig {
    automaticRollback: boolean;
    rollbackThreshold: number;
    healthCheckInterval: number;
    maxRollbackAttempts: number;
}

@injectable()
export class ModelScalingValidatorService extends EventEmitter {
    private readonly validationConfigs = new Map<string, ValidationConfig>();
    private readonly rollbackConfigs = new Map<string, RollbackConfig>();
    private readonly validationHistory = new Map<string, ValidationResult[]>();
    private readonly healthCheckTimers = new Map<string, NodeJS.Timer>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelHealthMonitorV2) private readonly healthMonitor: ModelHealthMonitorV2,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService
    ) {
        super();
        this.initializeDefaultConfigs();
    }

    private initializeDefaultConfigs(): void {
        const defaultValidation: ValidationConfig = {
            preScaleValidation: true,
            postScaleValidation: true,
            healthCheckTimeout: 30000,
            metricThresholds: {
                maxErrorRate: 0.05,
                minAvailability: 0.99,
                maxLatency: 2000
            }
        };

        const defaultRollback: RollbackConfig = {
            automaticRollback: true,
            rollbackThreshold: 0.8,
            healthCheckInterval: 5000,
            maxRollbackAttempts: 3
        };

        this.validationConfigs.set('default', defaultValidation);
        this.rollbackConfigs.set('default', defaultRollback);
    }

    public async validateScalingOperation(
        modelId: string,
        phase: 'pre' | 'post'
    ): Promise<ValidationResult> {
        try {
            const config = this.validationConfigs.get(modelId) || this.validationConfigs.get('default')!;
            const metrics = await this.collectValidationMetrics(modelId);
            const issues: string[] = [];

            if (metrics.errorRate > config.metricThresholds.maxErrorRate) {
                issues.push(`Error rate ${metrics.errorRate} exceeds threshold ${config.metricThresholds.maxErrorRate}`);
            }

            if (metrics.availability < config.metricThresholds.minAvailability) {
                issues.push(`Availability ${metrics.availability} below threshold ${config.metricThresholds.minAvailability}`);
            }

            if (metrics.latency > config.metricThresholds.maxLatency) {
                issues.push(`Latency ${metrics.latency}ms exceeds threshold ${config.metricThresholds.maxLatency}ms`);
            }

            const result: ValidationResult = {
                isValid: issues.length === 0,
                issues,
                metrics
            };

            this.logValidationResult(modelId, phase, result);
            this.storeValidationHistory(modelId, result);

            return result;
        } catch (error) {
            this.handleError('Validation failed', error);
            throw error;
        }
    }

    private async collectValidationMetrics(modelId: string): Promise<ValidationResult['metrics']> {
        const health = this.healthMonitor.getHealth(modelId);
        const metrics = await this.metricsService.getLatestMetrics();
        const modelMetrics = metrics.get(modelId);

        if (!health || !modelMetrics) {
            throw new Error(`Unable to collect metrics for model ${modelId}`);
        }

        return {
            errorRate: health.metrics.errorRate,
            availability: this.calculateAvailability(health),
            latency: health.metrics.responseTime,
            resourceUtilization: modelMetrics.resourceUtilization || 0
        };
    }

    public async startHealthCheck(modelId: string): Promise<void> {
        if (this.healthCheckTimers.has(modelId)) {
            return;
        }

        const config = this.rollbackConfigs.get(modelId) || this.rollbackConfigs.get('default')!;
        const timer = setInterval(async () => {
            try {
                await this.performHealthCheck(modelId);
            } catch (error) {
                this.handleError('Health check failed', error);
            }
        }, config.healthCheckInterval);

        this.healthCheckTimers.set(modelId, timer);
    }

    public stopHealthCheck(modelId: string): void {
        const timer = this.healthCheckTimers.get(modelId);
        if (timer) {
            clearInterval(timer);
            this.healthCheckTimers.delete(modelId);
        }
    }

    private async performHealthCheck(modelId: string): Promise<void> {
        const result = await this.validateScalingOperation(modelId, 'post');
        const config = this.rollbackConfigs.get(modelId) || this.rollbackConfigs.get('default')!;

        if (!result.isValid && config.automaticRollback) {
            this.emit('rollbackNeeded', {
                modelId,
                reason: result.issues,
                metrics: result.metrics
            });
        }
    }

    private calculateAvailability(health: any): number {
        const total = health.metrics.successes + health.metrics.failures;
        return total === 0 ? 1 : health.metrics.successes / total;
    }

    private storeValidationHistory(modelId: string, result: ValidationResult): void {
        const history = this.validationHistory.get(modelId) || [];
        history.push(result);
        this.validationHistory.set(modelId, history);
    }

    private logValidationResult(modelId: string, phase: string, result: ValidationResult): void {
        this.logger.info(`Validation result for model ${modelId} (${phase})`, {
            isValid: result.isValid,
            issues: result.issues,
            metrics: result.metrics
        });
    }

    private handleError(message: string, error: unknown): void {
        this.logger.error(message, { error });
        this.emit('error', { message, error });
    }
}
