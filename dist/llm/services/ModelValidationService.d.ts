import * as vscode from 'vscode';
import { LLMModelInfo } from '../llm-provider';
import { ModelValidationResult } from '../types';
/**
 * Service for validating model compatibility with system capabilities
 */
export declare class ModelValidationService implements vscode.Disposable {
    private readonly validationCache;
    private systemInfo;
    private readonly outputChannel;
    constructor();
    /**
     * Validate a model against system capabilities
     */
    validateModel(modelInfo: LLMModelInfo): Promise<ModelValidationResult>;
    /**
     * Get system information for validation
     */
    private getSystemInfo;
    /**
     * Infer model requirements based on parameters
     */
    private inferModelRequirements;
    /**
     * Get available disk space (platform specific implementation)
     */
    private getFreeDiskSpace;
    /**
     * Get CUDA information (platform specific implementation)
     */
    private getCudaInfo;
    /**
     * Compare CUDA versions
     */
    private compareCudaVersions;
    /**
     * Clear validation cache
     */
    clearCache(): void;
    /**
     * Invalidate system info (forces recheck)
     */
    invalidateSystemInfo(): void;
    private logValidationResult;
    private logSystemInfo;
    dispose(): void;
}
