import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { ILLMProvider } from '../llm-provider';
import {
    ILLMModelInfo,
    ILogger,
    ModelEvent,
    ModelValidationResult
} from '../types';
import { IModelValidationService } from './ModelValidationService';

@injectable()
export class ModelDiscoveryService extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private readonly modelRegistry = new Map<string, ILLMModelInfo>();
    private readonly providers: ILLMProvider[] = [];
    private discoveryInProgress = false;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(IModelValidationService) private readonly validationService: IModelValidationService
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Discovery');
    }

    public registerProvider(provider: ILLMProvider): void {
        this.providers.push(provider);
        this.logger.debug(`[ModelDiscoveryService] Registered provider: ${provider.name}`);
    }

    public async startDiscovery(): Promise<void> {
        if (this.discoveryInProgress) {
            this.logger.debug('[ModelDiscoveryService] Discovery already in progress');
            return;
        }

        this.discoveryInProgress = true;
        this.emit('discoveryStarted');

        try {
            const startTime = Date.now();
            const models = await this.discoverModels();

            this.logger.info(`[ModelDiscoveryService] Discovery completed in ${Date.now() - startTime}ms`);
            this.emit('discoveryCompleted', models);
        } catch (error) {
            this.handleError(new Error(`Discovery failed: ${error instanceof Error ? error.message : String(error)}`));
        } finally {
            this.discoveryInProgress = false;
        }
    }

    private async discoverModels(): Promise<ILLMModelInfo[]> {
        const discoveredModels: ILLMModelInfo[] = [];

        for (const provider of this.providers) {
            try {
                const models = await provider.getAvailableModels();
                for (const model of models) {
                    if (!this.modelRegistry.has(model.id)) {
                        const validation = await this.validationService.validateModel(model);
                        if (validation.isValid) {
                            this.modelRegistry.set(model.id, model);
                            discoveredModels.push(model);
                            this.emit(ModelEvent.ModelRegistered, model);
                            this.logModelDiscovered(model, validation);
                        } else {
                            this.logModelSkipped(model, validation);
                        }
                    }
                }
            } catch (error) {
                this.logger.error(`[ModelDiscoveryService] Provider ${provider.name} discovery failed:`, error);
            }
        }

        return discoveredModels;
    }

    public getDiscoveredModels(): ILLMModelInfo[] {
        return Array.from(this.modelRegistry.values());
    }

    public getModel(modelId: string): ILLMModelInfo | undefined {
        return this.modelRegistry.get(modelId);
    }

    public clearRegistry(): void {
        this.modelRegistry.clear();
        this.emit('registryCleared');
    }

    private logModelDiscovered(model: ILLMModelInfo, validation: ModelValidationResult): void {
        this.outputChannel.appendLine(`\nDiscovered model: ${model.id}`);
        this.outputChannel.appendLine(`Provider: ${model.provider}`);
        this.outputChannel.appendLine(`Parameters: ${JSON.stringify(model.parameters)}`);
        this.outputChannel.appendLine(`Validation: Passed`);
    }

    private logModelSkipped(model: ILLMModelInfo, validation: ModelValidationResult): void {
        this.outputChannel.appendLine(`\nSkipped incompatible model: ${model.id}`);
        this.outputChannel.appendLine(`Provider: ${model.provider}`);
        this.outputChannel.appendLine(`Issues: ${validation.issues.join(', ')}`);
    }

    private handleError(error: Error): void {
        this.logger.error('[ModelDiscoveryService]', error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.modelRegistry.clear();
        this.removeAllListeners();
    }
}
