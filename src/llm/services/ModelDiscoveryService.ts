import * as vscode from 'vscode';
import { LLMModelInfo } from '../llm-provider';
import { ModelMetricsService } from '../services/ModelMetricsService';
import { ModelValidationService } from '../services/ModelValidationService';
import { SystemInfoService, SystemInfo } from '../services/SystemInfoService';
import { LLMProvider } from '../llm-provider';
import { StatusService } from '../../services/statusService';

/**
 * Service for discovering and managing LLM models
 */
export class ModelDiscoveryService implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly modelRegistry = new Map<string, LLMModelInfo>();
    private readonly eventEmitter = new vscode.EventEmitter<void>();
    private readonly modelProviders: LLMProvider[] = [];

    constructor(
        private readonly metricsService: ModelMetricsService,
        private readonly validationService: ModelValidationService,
        private readonly systemService: SystemInfoService
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
                this.metricsService.recordMetrics({
                    id: model.id,
                    duration: Date.now() - startTime,
                    success: false
                });
                return;
            }

            this.modelRegistry.set(model.id, model);
            this.eventEmitter.fire();
            this.outputChannel.appendLine(`Registered model ${model.id}`);
            
            // Record successful registration
            this.metricsService.recordMetrics({
                id: model.id,
                duration: Date.now() - startTime,
                success: true
            });
        } catch (error) {
            this.outputChannel.appendLine(`Error registering model ${model.id}: ${error}`);
            this.metricsService.recordMetrics({
                id: model.id,
                duration: 0,
                success: false
            });
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

    /**
     * Perform model discovery across all providers
     */
    public async performModelDiscovery(): Promise<LLMModelInfo[]> {
        const discoveredModels: LLMModelInfo[] = [];
        
        try {
            // Get system capabilities
            const sysInfo = await this.getSystemCapabilities();
            
            // Discover models from each provider
            for (const provider of this.modelProviders) {
                const modelIds = await provider.getAvailableModels();
                
                for (const modelId of modelIds) {
                    const modelInfo = await provider.getModelInfo(modelId);
                    
                    // Validate model against system requirements
                    const validation = await this.validationService.validateModel(modelInfo, {
                        minMemoryGB: Math.ceil(sysInfo.totalMemoryGB * 0.7), // 70% of system RAM
                        recommendedMemoryGB: Math.ceil(sysInfo.totalMemoryGB * 0.8),
                        minDiskSpaceGB: sysInfo.freeDiskSpaceGB,
                        cudaSupport: sysInfo.cudaAvailable,
                        minCudaVersion: sysInfo.cudaVersion,
                        minCPUCores: sysInfo.cpuCores
                    });

                    if (validation.isValid) {
                        // Register valid model
                        await this.registerModel(modelInfo);
                        discoveredModels.push(modelInfo);
                        
                        // Initialize model metrics
                        this.metricsService.recordMetrics({
                            id: modelInfo.id,
                            duration: 0,
                            success: true
                        });
                    } else {
                        this.outputChannel.appendLine(`Skipping incompatible model ${modelInfo.id}: ${validation.issues.join(', ')}`);
                    }
                }
            }
        } catch (error) {
            this.outputChannel.appendLine(`Error during model discovery: ${error}`);
            throw new Error(`Model discovery failed: ${error}`);
        }

        return discoveredModels;
    }

    /**
     * Add a model provider
     */
    public addProvider(provider: LLMProvider): void {
        this.modelProviders.push(provider);
    }

    /**
     * Get system capabilities for model validation
     */
    private async getSystemCapabilities(): Promise<SystemInfo> {
        return this.systemService.getSystemInfo();
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.eventEmitter.dispose();
        this.modelRegistry.clear();
    }
}