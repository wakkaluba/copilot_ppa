import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger, LLMModelInfo, ModelValidationResult, CompatibilityResult } from '../types';
export declare class ModelValidator extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly outputChannel;
    private systemRequirements;
    constructor(logger: ILogger);
    validateModel(model: LLMModelInfo): Promise<ModelValidationResult>;
    checkCompatibility(modelA: LLMModelInfo, modelB: LLMModelInfo): Promise<CompatibilityResult>;
    private inferModelRequirements;
    private getSystemInfo;
    private getGPUInfo;
    private compareCudaVersions;
    private logValidationResult;
    private handleError;
    dispose(): void;
}
