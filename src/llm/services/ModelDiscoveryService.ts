import * as vscode from 'vscode';
import { LLMModelInfo } from '../llm-provider';
import { ModelMetricsService } from '../services/ModelMetricsService';
import { ModelValidationService } from '../services/ModelValidationService';

/**
 * Service for discovering and managing LLM models
 */
export class ModelDiscoveryService implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly modelRegistry = new Map<string, LLMModelInfo>();
    private readonly eventEmitter = new vscode.EventEmitter<void>();

    constructor(
        private readonly metricsService: ModelMetricsService,
        private readonly validationService: ModelValidationService
    ) {
        this.outputChannel = vscode.window.createOutputChannel('LLM Models');
    }

    /**
     * Register a model with the discovery service
     */
    public async registerModel(model: LLMModelInfo): Promise<void> {
        try {
            const startTime = Date.now();

            // Validate model before registration
            const validation = await this.validationService.validateModel(model);
            if (!validation.isValid) {
                this.outputChannel.appendLine(`Model ${model.id} failed validation: ${validation.issues.join(', ')}`);
                this.metricsService.recordMetrics(model.id, Date.now() - startTime, 0, true);
                return;
            }

            this.modelRegistry.set(model.id, model);
            this.eventEmitter.fire();
            this.outputChannel.appendLine(`Registered model ${model.id}`);
            
            // Record successful registration
            this.metricsService.recordMetrics(model.id, Date.now() - startTime, 0);
        } catch (error) {
            this.outputChannel.appendLine(`Error registering model ${model.id}: ${error}`);
            this.metricsService.recordMetrics(model.id, 0, 0, true);
            throw error;
        }
    }

    /**
     * Get all registered models
     */
    public getRegisteredModels(): LLMModelInfo[] {
        return Array.from(this.modelRegistry.values());
    }

    /**
     * Get model by ID
     */
    public getModel(modelId: string): LLMModelInfo | undefined {
        return this.modelRegistry.get(modelId);
    }

    /**
     * Remove a model from the registry
     */
    public unregisterModel(modelId: string): boolean {
        const result = this.modelRegistry.delete(modelId);
        if (result) {
            this.eventEmitter.fire();
            this.outputChannel.appendLine(`Unregistered model ${modelId}`);
        }
        return result;
    }

    /**
     * Event fired when the model registry changes
     */
    public get onDidChangeModels(): vscode.Event<void> {
        return this.eventEmitter.event;
    }

    /**
     * Get models that are compatible with the system
     */
    public async getCompatibleModels(): Promise<LLMModelInfo[]> {
        const models = this.getRegisteredModels();
        const compatibleModels: LLMModelInfo[] = [];

        for (const model of models) {
            const validation = await this.validationService.validateModel(model);
            if (validation.isValid) {
                compatibleModels.push(model);
            }
        }

        return compatibleModels;
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.eventEmitter.dispose();
    }
}