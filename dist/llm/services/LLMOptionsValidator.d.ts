import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}
export declare class LLMOptionsValidator extends EventEmitter implements vscode.Disposable {
    private readonly logger;
    private readonly outputChannel;
    constructor(logger: ILogger);
    validateRequestOptions(options: any): ValidationResult;
    validateModelConfig(config: any): ValidationResult;
    private logValidationResult;
    private handleError;
    dispose(): void;
}
