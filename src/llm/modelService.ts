import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ILogger } from '../logging/ILogger';
import { EventEmitter } from 'events';
import { 
    LLMModelInfo, 
    ModelEvent,
    ModelValidationResult,
    ModelMetrics,
    ModelConfig
} from './types';
import { ModelDiscoveryService } from './services/ModelDiscoveryService';
import { ModelMetricsService } from './services/ModelMetricsService';
import { ModelValidationService } from './services/ModelValidationService';
import { TelemetryService } from '../services/TelemetryService';

@injectable()
export class ModelService extends EventEmitter {
    private static instance: ModelService;
    private readonly models = new Map<string, LLMModelInfo>();
    private activeModelId?: string;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelDiscoveryService) private readonly discoveryService: ModelDiscoveryService,
        @inject(ModelMetricsService) private readonly metricsService: ModelMetricsService,
        @inject(ModelValidationService) private readonly validationService: ModelValidationService,
        @inject(TelemetryService) private readonly telemetryService: TelemetryService
    ) {
        super();
        this.setupEventListeners();
    }

    public static getInstance(
        logger: ILogger,
        discoveryService: ModelDiscoveryService,
        metricsService: ModelMetricsService,
        validationService: ModelValidationService,
        telemetryService: TelemetryService
    ): ModelService {
        if (!ModelService.instance) {
            ModelService.instance = new ModelService(
                logger,
                discoveryService,
                metricsService,
                validationService,
                telemetryService
            );
        }
        return ModelService.instance;
    }

    private setupEventListeners(): void {
        this.discoveryService.on('modelFound', this.handleModelFound.bind(this));
        this.metricsService.on('metricsUpdated', this.handleMetricsUpdated.bind(this));
        this.validationService.on('validationComplete', this.handleValidationComplete.bind(this));
    }

    public async initialize(): Promise<void> {
        try {
            await this.discoveryService.startDiscovery();
            this.telemetryService.sendEvent('modelService.initialized');
        } catch (error) {
            this.handleError(new Error(`Failed to initialize model service: ${error instanceof Error ? error.message : String(error)}`));
        }
    }

    public async getModelInfo(modelId: string): Promise<LLMModelInfo> {
        const model = this.models.get(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }
        return { ...model };
    }

    public async validateModel(modelId: string): Promise<ModelValidationResult> {
        try {
            const model = await this.getModelInfo(modelId);
            const result = await this.validationService.validateModel(model);
            
            this.telemetryService.sendEvent('modelService.validation', {
                modelId,
                isValid: result.isValid,
                issueCount: result.issues.length
            });

            return result;
        } catch (error) {
            this.handleError(new Error(`Failed to validate model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    public async getModelMetrics(modelId: string): Promise<ModelMetrics> {
        try {
            return await this.metricsService.getMetrics(modelId);
        } catch (error) {
            this.handleError(new Error(`Failed to get metrics for model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    public async setActiveModel(modelId: string): Promise<void> {
        try {
            const model = await this.getModelInfo(modelId);
            const validationResult = await this.validateModel(modelId);

            if (!validationResult.isValid) {
                throw new Error(`Model ${modelId} validation failed: ${validationResult.issues.join(', ')}`);
            }

            this.activeModelId = modelId;
            this.emit(ModelEvent.ActiveModelChanged, modelId);
            
            this.telemetryService.sendEvent('modelService.activeModelChanged', {
                modelId,
                provider: model.provider
            });
        } catch (error) {
            this.handleError(new Error(`Failed to set active model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    public getActiveModelId(): string | undefined {
        return this.activeModelId;
    }

    public async updateModelConfig(modelId: string, config: Partial<ModelConfig>): Promise<void> {
        try {
            const model = await this.getModelInfo(modelId);
            Object.assign(model.config, config);
            this.models.set(modelId, model);
            this.emit(ModelEvent.ModelUpdated, modelId);

            this.telemetryService.sendEvent('modelService.configUpdated', {
                modelId,
                configKeys: Object.keys(config)
            });
        } catch (error) {
            this.handleError(new Error(`Failed to update config for model ${modelId}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    public getAvailableModels(): LLMModelInfo[] {
        return Array.from(this.models.values()).map(model => ({ ...model }));
    }

    private handleModelFound(modelInfo: LLMModelInfo): void {
        this.models.set(modelInfo.id, modelInfo);
        this.emit(ModelEvent.ModelRegistered, modelInfo.id);
    }

    private handleMetricsUpdated(modelId: string, metrics: ModelMetrics): void {
        this.emit(ModelEvent.MetricsUpdated, { modelId, metrics });
    }

    private handleValidationComplete(modelId: string, result: ModelValidationResult): void {
        this.emit(ModelEvent.ValidationUpdated, { modelId, result });
    }

    private handleError(error: Error): void {
        this.logger.error('[ModelService]', error);
        this.emit('error', error);
        this.telemetryService.sendEvent('modelService.error', {
            error: error.message
        });
    }

    public dispose(): void {
        this.discoveryService.dispose();
        this.metricsService.dispose();
        this.validationService.dispose();
        this.removeAllListeners();
    }
}