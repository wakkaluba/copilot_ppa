import * as vscode from 'vscode';
import { LLMModelValidator } from './services/ModelValidationService';
import { ModelDiscoveryService } from './services/ModelDiscoveryService';
import { ModelMetricsService } from './services/ModelMetricsService';
import { ILLMModelService, ModelConfig, ModelInfo, ModelValidationResult } from './types';
import { Logger } from '../utils/logger';

export class ModelService implements ILLMModelService {
    private readonly validator: LLMModelValidator;
    private readonly discovery: ModelDiscoveryService;
    private readonly metrics: ModelMetricsService;
    private readonly logger: Logger;

    constructor(
        context: vscode.ExtensionContext,
        loggerFactory?: (category: string) => Logger
    ) {
        this.logger = loggerFactory?.('ModelService') ?? new Logger('ModelService');
        this.validator = new LLMModelValidator();
        this.discovery = new ModelDiscoveryService(context);
        this.metrics = new ModelMetricsService();
    }

    public async validateModel(modelId: string): Promise<ModelValidationResult> {
        try {
            const modelInfo = await this.discovery.getModelInfo(modelId);
            return await this.validator.validateModel(modelInfo);
        } catch (error) {
            this.logger.error('Model validation failed:', error);
            throw this.wrapError(error, `Validation failed for model ${modelId}`);
        }
    }

    public async getAvailableModels(): Promise<ModelInfo[]> {
        try {
            return await this.discovery.discoverModels();
        } catch (error) {
            this.logger.error('Failed to get available models:', error);
            throw this.wrapError(error, 'Failed to retrieve available models');
        }
    }

    public async getModelPerformance(modelId: string): Promise<ModelPerformanceMetrics> {
        return this.metrics.getMetrics(modelId);
    }

    public trackModelUsage(modelId: string, metrics: ModelUsageData): void {
        try {
            this.metrics.trackUsage(modelId, metrics);
        } catch (error) {
            this.logger.warn('Failed to track model usage:', error);
        }
    }

    public async validateModelCompatibility(config: ModelConfig): Promise<{ 
        isCompatible: boolean; 
        issues: string[] 
    }> {
        try {
            const systemSpecs = await this.discovery.getSystemSpecs();
            return await this.validator.checkCompatibility(config, systemSpecs);
        } catch (error) {
            this.logger.error('Compatibility check failed:', error);
            throw this.wrapError(error, 'Failed to check model compatibility');
        }
    }

    private wrapError(error: unknown, message: string): Error {
        if (error instanceof Error) {
            return new Error(`${message}: ${error.message}`);
        }
        return new Error(`${message}: ${String(error)}`);
    }

    public dispose(): void {
        this.metrics.dispose();
        this.discovery.dispose();
        this.validator.dispose();
    }
}