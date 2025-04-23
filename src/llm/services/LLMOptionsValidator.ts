import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';

export interface ValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

@injectable()
export class LLMOptionsValidator extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('LLM Options Validation');
    }

    public validateRequestOptions(options: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Temperature validation
        if (options.temperature !== undefined) {
            if (typeof options.temperature !== 'number') {
                errors.push('Temperature must be a number');
            } else if (options.temperature < 0 || options.temperature > 2) {
                errors.push('Temperature must be between 0 and 2');
            } else if (options.temperature > 1) {
                warnings.push('Temperature > 1 may lead to very random outputs');
            }
        }

        // Max tokens validation
        if (options.maxTokens !== undefined) {
            if (typeof options.maxTokens !== 'number') {
                errors.push('maxTokens must be a number');
            } else if (!Number.isInteger(options.maxTokens)) {
                errors.push('maxTokens must be an integer');
            } else if (options.maxTokens < 1) {
                errors.push('maxTokens must be positive');
            } else if (options.maxTokens > 32000) {
                errors.push('maxTokens exceeds maximum allowed value of 32000');
            }
        }

        // Top P validation
        if (options.topP !== undefined) {
            if (typeof options.topP !== 'number') {
                errors.push('topP must be a number');
            } else if (options.topP < 0 || options.topP > 1) {
                errors.push('topP must be between 0 and 1');
            }
        }

        // Presence penalty validation
        if (options.presencePenalty !== undefined) {
            if (typeof options.presencePenalty !== 'number') {
                errors.push('presencePenalty must be a number');
            } else if (options.presencePenalty < -2 || options.presencePenalty > 2) {
                errors.push('presencePenalty must be between -2 and 2');
            }
        }

        // Frequency penalty validation
        if (options.frequencyPenalty !== undefined) {
            if (typeof options.frequencyPenalty !== 'number') {
                errors.push('frequencyPenalty must be a number');
            } else if (options.frequencyPenalty < -2 || options.frequencyPenalty > 2) {
                errors.push('frequencyPenalty must be between -2 and 2');
            }
        }

        // Stop sequences validation
        if (options.stopSequences !== undefined) {
            if (!Array.isArray(options.stopSequences)) {
                errors.push('stopSequences must be an array');
            } else {
                const invalidSequences = options.stopSequences.filter(seq => typeof seq !== 'string');
                if (invalidSequences.length > 0) {
                    errors.push('All stop sequences must be strings');
                }
            }
        }

        // Stream option validation
        if (options.stream !== undefined && typeof options.stream !== 'boolean') {
            errors.push('stream must be a boolean value');
        }

        const result: ValidationResult = {
            isValid: errors.length === 0,
            errors,
            warnings
        };

        this.logValidationResult(options, result);
        return result;
    }

    public validateModelConfig(config: any): ValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Required fields
        const requiredFields = ['maxTokens', 'temperature'];
        for (const field of requiredFields) {
            if (config[field] === undefined) {
                errors.push(`Missing required field: ${field}`);
            }
        }

        // Batch size validation
        if (config.batchSize !== undefined) {
            if (!Number.isInteger(config.batchSize)) {
                errors.push('batchSize must be an integer');
            } else if (config.batchSize < 1) {
                errors.push('batchSize must be positive');
            } else if (config.batchSize > 64) {
                warnings.push('Large batch size may impact performance');
            }
        }

        // Context length validation
        if (config.contextLength !== undefined) {
            if (!Number.isInteger(config.contextLength)) {
                errors.push('contextLength must be an integer');
            } else if (config.contextLength < 1) {
                errors.push('contextLength must be positive');
            } else if (config.contextLength > 32000) {
                errors.push('contextLength exceeds maximum allowed value');
            }
        }

        // Seed validation
        if (config.seed !== undefined) {
            if (!Number.isInteger(config.seed)) {
                errors.push('seed must be an integer');
            } else if (config.seed < 0) {
                errors.push('seed must be non-negative');
            }
        }

        const result: ValidationResult = {
            isValid: errors.length === 0,
            errors,
            warnings
        };

        this.logValidationResult(config, result);
        return result;
    }

    private logValidationResult(input: any, result: ValidationResult): void {
        this.outputChannel.appendLine('\nValidation Result:');
        this.outputChannel.appendLine(`Valid: ${result.isValid}`);
        
        if (result.errors.length > 0) {
            this.outputChannel.appendLine('Errors:');
            result.errors.forEach(error => this.outputChannel.appendLine(`- ${error}`));
        }
        
        if (result.warnings.length > 0) {
            this.outputChannel.appendLine('Warnings:');
            result.warnings.forEach(warning => this.outputChannel.appendLine(`- ${warning}`));
        }

        this.outputChannel.appendLine('Input:');
        this.outputChannel.appendLine(JSON.stringify(input, null, 2));
    }

    private handleError(error: Error): void {
        this.logger.error('[LLMOptionsValidator]', error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
