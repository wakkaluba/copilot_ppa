import { EventEmitter } from 'events';
import { inject, injectable } from 'inversify';
import * as os from 'os';
import * as vscode from 'vscode';
import { ILogger } from '../../utils/logger';
import { ILLMModelInfo, IModelRequirements, IModelValidationResult } from '../types';
import { ISystemRequirements, ModelSystemManager } from './ModelSystemManager';

export interface IValidationRule {
    id: string;
    type: 'input' | 'output' | 'model' | 'resource';
    severity: 'error' | 'warning' | 'info';
    validate: (context: IValidationContext) => Promise<IValidationResult>;
}

export interface IValidationContext {
    request?: ILLMRequest;
    response?: ILLMResponse;
    modelId: string;
    timestamp: number;
    metadata?: Record<string, unknown>;
}

export interface IValidationResult {
    ruleId: string;
    valid: boolean;
    severity: 'error' | 'warning' | 'info';
    message: string;
    details?: Record<string, unknown>;
}

export interface IValidationSummary {
    modelId: string;
    timestamp: number;
    totalRules: number;
    passedRules: number;
    failedRules: number;
    results: IValidationResult[];
}

/**
 * Service for validating model compatibility with system capabilities
 */
@injectable()
export class ModelValidationService extends EventEmitter implements vscode.Disposable {
    private readonly validationCache = new Map<string, IModelValidationResult>();
    private systemInfo: SystemInfo | null = null;
    private readonly outputChannel: vscode.OutputChannel;
    private readonly rules = new Map<string, IValidationRule>();
    private readonly validationHistory = new Map<string, IValidationSummary[]>();

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ModelSystemManager) private readonly systemManager: ModelSystemManager
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Validation');
        this.initializeDefaultRules();
    }

    /**
     * Validate a model against system capabilities
     */
    public async validateModel(model: ILLMModelInfo): Promise<IModelValidationResult> {
        try {
            const requirements = this.inferModelRequirements(model);
            const systemValid = await this.validateSystemRequirements(requirements);
            const modelValid = this.validateModelMetadata(model);

            const result: IModelValidationResult = {
                isValid: systemValid.meetsMinimumRequirements && modelValid.isValid,
                issues: [...modelValid.issues],
                systemCompatibility: systemValid
            };

            this.emit('validationComplete', { modelId: model.id, result });
            return result;
        } catch (error) {
            this.handleError('Model validation failed', error as Error);
            throw error;
        }
    }

    /**
     * Get system information for validation
     */
    private async getSystemInfo(): Promise<SystemInfo> {
        if (!this.systemInfo) {
            const totalMemory = os.totalmem() / (1024 * 1024 * 1024); // Convert to GB
            const freeDiskSpace = await this.getFreeDiskSpace();
            const cpuCores = os.cpus().length;
            const cudaInfo = await this.getCudaInfo();

            const systemInfo: SystemInfo = {
                totalMemoryGB: Math.round(totalMemory),
                freeDiskSpaceGB: Math.round(freeDiskSpace),
                cpuCores,
                cudaAvailable: cudaInfo.available,
                cudaVersion: cudaInfo.version || undefined
            };

            this.systemInfo = systemInfo;
            if (systemInfo) {
                this.logSystemInfo(systemInfo);
            }
        }

        if (!this.systemInfo) {
            throw new Error('Failed to initialize system information');
        }

        return this.systemInfo;
    }

    /**
     * Infer model requirements based on parameters
     */
    private inferModelRequirements(model: ILLMModelInfo): IModelRequirements {
        const parameters = model.parameters || 0;

        return {
            memory: {
                minimum: Math.max(4, Math.ceil(parameters * 2)),
                recommended: Math.max(8, Math.ceil(parameters * 3))
            },
            cpu: {
                minimumCores: Math.max(2, Math.ceil(parameters / 4)),
                recommendedCores: Math.max(4, Math.ceil(parameters / 2))
            },
            gpu: parameters > 7 ? { required: true } : undefined
        };
    }

    /**
     * Get available disk space (platform specific implementation)
     */
    private async getFreeDiskSpace(): Promise<number> {
        try {
            // This is a placeholder - actual implementation would use platform-specific APIs
            // Windows: wmic logicaldisk, Mac/Linux: df command
            return 100; // Default to 100GB
        } catch (error) {
            this.outputChannel.appendLine(`Error getting disk space: ${error}`);
            return 0;
        }
    }

    /**
     * Get CUDA information (platform specific implementation)
     */
    private async getCudaInfo(): Promise<{ available: boolean; version?: string }> {
        try {
            // This is a placeholder - actual implementation would check:
            // - Windows: registry or nvidia-smi
            // - Linux: nvidia-smi or libcuda.so
            // - Mac: No CUDA support
            return { available: false };
        } catch (error) {
            this.outputChannel.appendLine(`Error checking CUDA info: ${error}`);
            return { available: false };
        }
    }

    /**
     * Compare CUDA versions
     */
    private compareCudaVersions(version1: string, version2: string): number {
        const v1Parts = version1.split('.').map(Number);
        const v2Parts = version2.split('.').map(Number);

        for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
            const v1 = v1Parts[i] || 0;
            const v2 = v2Parts[i] || 0;
            if (v1 !== v2) {
                return v1 - v2;
            }
        }

        return 0;
    }

    /**
     * Clear validation cache
     */
    public clearCache(): void {
        this.validationCache.clear();
    }

    /**
     * Invalidate system info (forces recheck)
     */
    public invalidateSystemInfo(): void {
        this.systemInfo = null;
        this.clearCache();
    }

    private logValidationResult(model: ILLMModelInfo, result: IModelValidationResult): void {
        this.outputChannel.appendLine(`\nValidation result for model ${model.id}:`);
        this.outputChannel.appendLine(`Valid: ${result.isValid}`);
        if (result.issues.length > 0) {
            this.outputChannel.appendLine('Issues:');
            result.issues.forEach(issue => this.outputChannel.appendLine(`- ${issue}`));
        }
    }

    private logSystemInfo(info: SystemInfo): void {
        this.outputChannel.appendLine('\nSystem Information:');
        this.outputChannel.appendLine(`Memory: ${info.totalMemoryGB}GB`);
        this.outputChannel.appendLine(`Disk Space: ${info.freeDiskSpaceGB}GB`);
        this.outputChannel.appendLine(`CPU Cores: ${info.cpuCores}`);
        this.outputChannel.appendLine(`CUDA Available: ${info.cudaAvailable}`);
        if (info.cudaVersion) {
            this.outputChannel.appendLine(`CUDA Version: ${info.cudaVersion}`);
        }
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.rules.clear();
        this.validationHistory.clear();
        this.removeAllListeners();
    }

    private handleError(message: string, error: Error): void {
        this.logger.error(`${message}: ${error.message}`);
        this.outputChannel.appendLine(`${message}: ${error.message}`);
    }

    private async validateSystemRequirements(requirements: IModelRequirements): Promise<ISystemRequirements> {
        const systemInfo = await this.getSystemInfo();
        const issues: string[] = [];

        // Memory check
        if (systemInfo.totalMemoryGB < requirements.memory.minimum) {
            issues.push(`Insufficient memory: ${systemInfo.totalMemoryGB}GB available, ${requirements.memory.minimum}GB required`);
        }

        // Disk space check
        if (systemInfo.freeDiskSpaceGB < requirements.memory.minimum) {
            issues.push(`Insufficient disk space: ${systemInfo.freeDiskSpaceGB}GB available, ${requirements.memory.minimum}GB required`);
        }

        // CUDA support check
        if (requirements.gpu?.required) {
            if (!systemInfo.cudaAvailable) {
                issues.push('CUDA support required but not available');
            } else if (
                requirements.gpu.minimumVRAM &&
                systemInfo.cudaVersion &&
                this.compareCudaVersions(systemInfo.cudaVersion, requirements.gpu.minimumVRAM.toString()) < 0
            ) {
                issues.push(`CUDA version ${requirements.gpu.minimumVRAM} required, but ${systemInfo.cudaVersion} found`);
            }
        }

        // CPU cores check
        if (systemInfo.cpuCores < requirements.cpu.minimumCores) {
            issues.push(`Insufficient CPU cores: ${systemInfo.cpuCores} available, ${requirements.cpu.minimumCores} required`);
        }

        return {
            meetsMinimumRequirements: issues.length === 0,
            meetsRecommendedRequirements: systemInfo.totalMemoryGB >= requirements.memory.recommended && systemInfo.cpuCores >= requirements.cpu.recommendedCores,
            issues
        };
    }

    private validateModelMetadata(model: ILLMModelInfo): IModelValidationResult {
        const issues: string[] = [];

        // Add model metadata validation logic here

        return {
            isValid: issues.length === 0,
            issues
        };
    }

    private initializeDefaultRules(): void {
        this.registerRule({
            id: 'input_size',
            type: 'input',
            severity: 'error',
            validate: async (context) => ({
                ruleId: 'input_size',
                valid: this.validateInputSize(context),
                severity: 'error',
                message: 'Input size validation'
            })
        });

        this.registerRule({
            id: 'output_quality',
            type: 'output',
            severity: 'warning',
            validate: async (context) => ({
                ruleId: 'output_quality',
                valid: this.validateOutputQuality(context),
                severity: 'warning',
                message: 'Output quality validation'
            })
        });
    }

    public registerRule(rule: IValidationRule): void {
        if (this.rules.has(rule.id)) {
            throw new Error(`Rule with ID ${rule.id} already exists`);
        }

        this.rules.set(rule.id, rule);
        this.emit('ruleRegistered', rule);
    }

    public async validateRequest(request: ILLMRequest): Promise<IValidationSummary> {
        try {
            const context: IValidationContext = {
                request,
                modelId: request.model,
                timestamp: Date.now()
            };

            return this.runValidation(context);
        } catch (error) {
            this.handleError('Failed to validate request', error as Error);
            throw error;
        }
    }

    public async validateResponse(
        request: ILLMRequest,
        response: ILLMResponse
    ): Promise<IValidationSummary> {
        try {
            const context: IValidationContext = {
                request,
                response,
                modelId: request.model,
                timestamp: Date.now()
            };

            return this.runValidation(context);
        } catch (error) {
            this.handleError('Failed to validate response', error as Error);
            throw error;
        }
    }

    private async runValidation(context: IValidationContext): Promise<IValidationSummary> {
        const results: IValidationResult[] = [];
        const relevantRules = Array.from(this.rules.values())
            .filter(rule => this.isRuleApplicable(rule, context));

        for (const rule of relevantRules) {
            try {
                const result = await rule.validate(context);
                results.push(result);
            } catch (error) {
                this.logger.error(`Rule ${rule.id} validation failed`, error);
                results.push({
                    ruleId: rule.id,
                    valid: false,
                    severity: 'error',
                    message: `Validation failed: ${(error as Error).message}`
                });
            }
        }

        const summary: IValidationSummary = {
            modelId: context.modelId,
            timestamp: context.timestamp,
            totalRules: relevantRules.length,
            passedRules: results.filter(r => r.valid).length,
            failedRules: results.filter(r => !r.valid).length,
            results
        };

        this.logValidationSummary(summary);
        return summary;
    }

    private isRuleApplicable(rule: IValidationRule, context: IValidationContext): boolean {
        switch (rule.type) {
            case 'input':
                return !!context.request;
            case 'output':
                return !!context.response;
            case 'model':
                return true;
            case 'resource':
                return !!context.metadata?.resourceInfo;
            default:
                return false;
        }
    }

    private validateInputSize(context: IValidationContext): boolean {
        if (!context.request?.input) return false;

        // This would implement actual input size validation logic
        const input = context.request.input;
        return typeof input === 'string' && input.length > 0 && input.length <= 4096;
    }

    private validateOutputQuality(context: IValidationContext): boolean {
        if (!context.response?.output) return false;

        // This would implement actual output quality validation logic
        const output = context.response.output;
        return typeof output === 'string' && output.length > 0;
    }

    private logValidationSummary(summary: IValidationSummary): void {
        let modelHistory = this.validationHistory.get(summary.modelId);
        if (!modelHistory) {
            modelHistory = [];
            this.validationHistory.set(summary.modelId, modelHistory);
        }

        modelHistory.push(summary);
        this.emit('validationCompleted', summary);

        // Prune old validation records
        const cutoff = Date.now() - 24 * 60 * 60 * 1000; // 24 hours
        modelHistory = modelHistory.filter(s => s.timestamp >= cutoff);
        this.validationHistory.set(summary.modelId, modelHistory);
    }

    public getRegisteredRules(): IValidationRule[] {
        return Array.from(this.rules.values());
    }

    public getRuleById(ruleId: string): IValidationRule | undefined {
        return this.rules.get(ruleId);
    }

    public getValidationHistory(modelId: string): IValidationSummary[] {
        return this.validationHistory.get(modelId) || [];
    }
}
