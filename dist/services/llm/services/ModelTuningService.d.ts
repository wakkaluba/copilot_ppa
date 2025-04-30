import { ILogger } from '../../../utils/logger';
import { ModelMetricsService } from './ModelMetricsService';
import { TuningRequest, TuningResult } from '../types';
import { EventEmitter } from 'events';
export declare class ModelTuningService extends EventEmitter {
    private readonly logger;
    private readonly metricsService;
    private readonly tuningHistory;
    private readonly activeTuning;
    constructor(logger: ILogger, metricsService: ModelMetricsService);
    tuneModel(modelId: string, request: TuningRequest): Promise<TuningResult>;
    getTuningHistory(modelId: string): TuningResult[];
    private runTuning;
    private defineParameterSpace;
    private getInitialParameters;
    private generateParameters;
    private getCurrentValue;
    private evaluateParameters;
    private estimateResponseTimeImprovement;
    private estimateQualityImprovement;
    private estimateEfficiencyImprovement;
    private calculateConfidence;
    private handleError;
    dispose(): void;
}
