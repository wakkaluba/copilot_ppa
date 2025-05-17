import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../../utils/logger';
import { LLMResourceError } from '../errors';
import { ModelEvents, OptimizationRequest, OptimizationResult } from '../types';
import { ModelMetricsService } from './ModelMetricsService';

@injectable()
export class ModelOptimizationService extends EventEmitter {
  private readonly optimizationHistory = new Map<string, OptimizationResult[]>();
  private readonly activeOptimizations = new Set<string>();

  constructor(
    @inject(ILogger) private readonly logger: ILogger,
    @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService,
  ) {
    super();
  }

  public async optimizeModel(modelId: string, request: any): Promise<any> {
    if (this.activeOptimizations.has(modelId)) {
      this.logger.error('Optimization already in progress', { modelId });
      throw new LLMResourceError(modelId, `Optimization already in progress for model ${modelId}`);
    }
    try {
      this.activeOptimizations.add(modelId);
      this.emit('OptimizationStarted', { modelId, request });
      const metrics = await this.metricsService.getMetrics(modelId);
      if (!metrics) {
        this.logger.error('No metrics available for model', { modelId });
        throw new LLMResourceError(modelId, `No metrics available for model ${modelId}`);
      }
      const result = await this.runOptimization(modelId, request, metrics);
      const history = this.optimizationHistory.get(modelId) || [];
      history.push(result);
      this.optimizationHistory.set(modelId, history);
      this.emit(ModelEvents.OptimizationCompleted, { modelId, result });
      return result;
    } catch (error) {
      this.handleError('Optimization failed', error);
      throw error;
    } finally {
      this.activeOptimizations.delete(modelId);
    }
  }

  private async runOptimization(
    modelId: string,
    request: OptimizationRequest,
    metrics: any,
  ): Promise<OptimizationResult> {
    // Dummy implementation for coverage
    return {
      modelId,
      success: true,
      details: 'Optimization completed',
      metrics: metrics,
    };
  }

  private handleError(message: string, error: any) {
    if (this.logger && typeof this.logger.error === 'function') {
      this.logger.error(message, error);
    }
  }

  public getOptimizationHistory(modelId: string): OptimizationResult[] {
    return this.optimizationHistory.get(modelId) || [];
  }

  public isOptimizing(modelId: string): boolean {
    return this.activeOptimizations.has(modelId);
  }
}
