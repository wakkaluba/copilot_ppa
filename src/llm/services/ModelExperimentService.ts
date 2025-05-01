import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../utils/logger';
import { ILLMRequest, ILLMResponse } from '../types';

export interface IExperimentConfig {
    id: string;
    name: string;
    description?: string;
    modelIds: string[];
    startDate: Date;
    endDate?: Date;
    sampleRate: number;
    criteria: IExperimentCriteria;
    metadata?: Record<string, unknown>;
}

export interface IExperimentCriteria {
    metrics: IMetricDefinition[];
    thresholds: IThresholdDefinition[];
    customEvaluators?: ICustomEvaluator[];
}

export interface IMetricDefinition {
    name: string;
    type: 'latency' | 'accuracy' | 'cost' | 'custom';
    weight: number;
    aggregation: 'mean' | 'median' | 'p95' | 'max';
}

export interface IThresholdDefinition {
    metricName: string;
    operator: '>' | '<' | '>=' | '<=' | '==' | '!=';
    value: number;
    severity: 'error' | 'warning';
}

export interface ICustomEvaluator {
    name: string;
    evaluate: (request: ILLMRequest, response: ILLMResponse) => Promise<number>;
}

export interface IExperimentResult {
    experimentId: string;
    modelId: string;
    timestamp: number;
    metrics: Record<string, number>;
    thresholdViolations: IThresholdViolation[];
    metadata?: Record<string, unknown>;
}

export interface IThresholdViolation {
    threshold: IThresholdDefinition;
    actualValue: number;
    timestamp: number;
}

export interface IExperimentSummary {
    config: IExperimentConfig;
    status: 'running' | 'completed' | 'failed' | 'stopped';
    startTime: number;
    endTime?: number;
    totalSamples: number;
    results: Record<string, IExperimentResult[]>;
}

@injectable()
export class ModelExperimentService extends EventEmitter {
    private readonly experiments = new Map<string, IExperimentConfig>();
    private readonly results = new Map<string, IExperimentResult[]>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
    }

    public async createExperiment(config: IExperimentConfig): Promise<void> {
        if (this.experiments.has(config.id)) {
            throw new Error(`Experiment with ID ${config.id} already exists`);
        }

        this.validateExperimentConfig(config);
        this.experiments.set(config.id, config);
        this.results.set(config.id, []);
        this.emit('experimentCreated', config);
    }

    public async recordResult(
        experimentId: string,
        request: ILLMRequest,
        response: ILLMResponse
    ): Promise<void> {
        const experiment = this.experiments.get(experimentId);
        if (!experiment) {
            throw new Error(`Experiment ${experimentId} not found`);
        }

        try {
            const result = await this.evaluateResult(experiment, request, response);
            const results = this.results.get(experimentId) || [];
            results.push(result);
            this.results.set(experimentId, results);
            this.emit('resultRecorded', result);

            await this.checkThresholds(experiment, result);
        } catch (error) {
            this.handleError(`Failed to record result for experiment ${experimentId}`, error as Error);
            throw error;
        }
    }

    private async evaluateResult(
        experiment: IExperimentConfig,
        request: ILLMRequest,
        response: ILLMResponse
    ): Promise<IExperimentResult> {
        const metrics: Record<string, number> = {};
        const violations: IThresholdViolation[] = [];

        for (const metric of experiment.criteria.metrics) {
            const value = await this.evaluateMetric(metric, request, response);
            metrics[metric.name] = value;
        }

        for (const threshold of experiment.criteria.thresholds) {
            const value = metrics[threshold.metricName];
            if (this.isThresholdViolated(threshold, value)) {
                violations.push({
                    threshold,
                    actualValue: value,
                    timestamp: Date.now()
                });
            }
        }

        return {
            experimentId: experiment.id,
            modelId: request.model,
            timestamp: Date.now(),
            metrics,
            thresholdViolations: violations
        };
    }

    private async evaluateMetric(
        metric: IMetricDefinition,
        request: ILLMRequest,
        response: ILLMResponse
    ): Promise<number> {
        switch (metric.type) {
            case 'latency':
                return this.evaluateLatency(response);
            case 'accuracy':
                return this.evaluateAccuracy(request, response);
            case 'cost':
                return this.evaluateCost(request, response);
            case 'custom':
                return this.evaluateCustomMetric(metric, request, response);
            default:
                throw new Error(`Unknown metric type: ${metric.type}`);
        }
    }

    private evaluateLatency(response: ILLMResponse): number {
        return response.timing?.total || 0;
    }

    private evaluateAccuracy(request: ILLMRequest, response: ILLMResponse): number {
        // Implement accuracy evaluation logic
        return 1.0;
    }

    private evaluateCost(request: ILLMRequest, response: ILLMResponse): number {
        // Implement cost calculation logic
        return 0.0;
    }

    private async evaluateCustomMetric(
        metric: IMetricDefinition,
        request: ILLMRequest,
        response: ILLMResponse
    ): Promise<number> {
        const evaluator = this.findCustomEvaluator(metric.name);
        if (!evaluator) {
            throw new Error(`Custom evaluator not found for metric: ${metric.name}`);
        }
        return evaluator.evaluate(request, response);
    }

    private findCustomEvaluator(name: string): ICustomEvaluator | undefined {
        // Implementation to find custom evaluator
        return undefined;
    }

    private isThresholdViolated(threshold: IThresholdDefinition, value: number): boolean {
        switch (threshold.operator) {
            case '>': return value > threshold.value;
            case '<': return value < threshold.value;
            case '>=': return value >= threshold.value;
            case '<=': return value <= threshold.value;
            case '==': return value === threshold.value;
            case '!=': return value !== threshold.value;
            default: return false;
        }
    }

    private async checkThresholds(
        experiment: IExperimentConfig,
        result: IExperimentResult
    ): Promise<void> {
        if (result.thresholdViolations.length > 0) {
            const errorViolations = result.thresholdViolations
                .filter(v => v.threshold.severity === 'error');

            if (errorViolations.length > 0) {
                this.emit('thresholdViolation', {
                    experimentId: experiment.id,
                    modelId: result.modelId,
                    violations: errorViolations
                });
            }
        }
    }

    private validateExperimentConfig(config: IExperimentConfig): void {
        if (!config.modelIds.length) {
            throw new Error('Experiment must include at least one model');
        }

        if (config.sampleRate <= 0 || config.sampleRate > 1) {
            throw new Error('Sample rate must be between 0 and 1');
        }

        if (!config.criteria.metrics.length) {
            throw new Error('Experiment must include at least one metric');
        }
    }

    public getExperimentSummary(experimentId: string): IExperimentSummary {
        const config = this.experiments.get(experimentId);
        if (!config) {
            throw new Error(`Experiment ${experimentId} not found`);
        }

        const results = this.results.get(experimentId) || [];
        const resultsByModel: Record<string, IExperimentResult[]> = {};

        for (const result of results) {
            if (!resultsByModel[result.modelId]) {
                resultsByModel[result.modelId] = [];
            }
            resultsByModel[result.modelId].push(result);
        }

        return {
            config,
            status: this.getExperimentStatus(config),
            startTime: config.startDate.getTime(),
            endTime: config.endDate?.getTime(),
            totalSamples: results.length,
            results: resultsByModel
        };
    }

    private getExperimentStatus(config: IExperimentConfig): IExperimentSummary['status'] {
        const now = Date.now();
        if (config.endDate && now > config.endDate.getTime()) {
            return 'completed';
        }
        if (now < config.startDate.getTime()) {
            return 'stopped';
        }
        return 'running';
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelExperimentService]', message, error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.experiments.clear();
        this.results.clear();
        this.removeAllListeners();
    }
}
