import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../../services/logging/ILogger';
import { HardwareSpecs, LLMModelInfo } from '../types';
export declare class ModelCompatibilityManager extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly compatibilityCache;
    private readonly outputChannel;
    constructor(logger: ILogger);
    checkModelCompatibility(model: LLMModelInfo, hardware: HardwareSpecs): Promise<{
        compatible: boolean;
        issues: string[];
    }>;
    validateDependencies(modelId: string, dependencies: string[]): Promise<{
        valid: boolean;
        missing: string[];
    }>;
    private inferModelRequirements;
    private getHardwareHash;
    private logCompatibilityCheck;
    private handleError;
    clearCache(): void;
    dispose(): void;
}
