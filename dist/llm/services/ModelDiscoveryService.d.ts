import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger, LLMModelInfo } from '../types';
import { ModelValidationService } from './ModelValidationService';
import { LLMProvider } from '../llm-provider';
export declare class ModelDiscoveryService extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly validationService;
    private readonly outputChannel;
    private readonly modelRegistry;
    private readonly providers;
    private discoveryInProgress;
    constructor(logger: ILogger, validationService: ModelValidationService);
    registerProvider(provider: LLMProvider): void;
    startDiscovery(): Promise<void>;
    private discoverModels;
    getDiscoveredModels(): LLMModelInfo[];
    getModel(modelId: string): LLMModelInfo | undefined;
    clearRegistry(): void;
    private logModelDiscovered;
    private logModelSkipped;
    private handleError;
    dispose(): void;
}
