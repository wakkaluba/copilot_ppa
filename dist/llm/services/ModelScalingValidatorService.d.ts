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
export declare class ModelScalingValidatorService extends EventEmitter {
    private readonly logger;
    private readonly healthMonitor;
    private readonly metricsService;
    private readonly validationConfigs;
    private readonly rollbackConfigs;
    private readonly validationHistory;
    private readonly healthCheckTimers;
    constructor(logger: ILogger, healthMonitor: ModelHealthMonitorV2, metricsService: ModelMetricsService);
    private initializeDefaultConfigs;
    validateScalingOperation(modelId: string, phase: 'pre' | 'post'): Promise<ValidationResult>;
    private collectValidationMetrics;
    startHealthCheck(modelId: string): Promise<void>;
    stopHealthCheck(modelId: string): void;
    private performHealthCheck;
    private calculateAvailability;
    private storeValidationHistory;
    private logValidationResult;
    private handleError;
}
