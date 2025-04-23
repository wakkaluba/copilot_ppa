import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { 
    ILogger,
    LLMModelInfo,
    ModelValidationResult,
    ModelRequirements,
    SystemInfo,
    CompatibilityResult
} from '../types';

@injectable()
export class ModelValidator extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private systemRequirements: SystemInfo | null = null;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Validation');
    }

    public async validateModel(model: LLMModelInfo): Promise<ModelValidationResult> {
        try {
            const requirements = this.inferModelRequirements(model);
            const systemInfo = await this.getSystemInfo();
            const issues: string[] = [];

            // Memory requirements
            if (systemInfo.totalMemoryGB < requirements.minMemoryGB) {
                issues.push(`Insufficient memory: ${systemInfo.totalMemoryGB}GB available, ${requirements.minMemoryGB}GB required`);
            }

            // GPU requirements
            if (requirements.requiresGPU && !systemInfo.gpuInfo?.available) {
                issues.push('GPU required but not available');
            } else if (requirements.minGPUMemoryGB && systemInfo.gpuInfo?.memoryGB < requirements.minGPUMemoryGB) {
                issues.push(`Insufficient GPU memory: ${systemInfo.gpuInfo?.memoryGB}GB available, ${requirements.minGPUMemoryGB}GB required`);
            }

            // CPU requirements
            if (systemInfo.cpuCores < requirements.minCPUCores) {
                issues.push(`Insufficient CPU cores: ${systemInfo.cpuCores} available, ${requirements.minCPUCores} required`);
            }

            // Disk space requirements
            if (systemInfo.freeDiskSpaceGB < requirements.minDiskSpaceGB) {
                issues.push(`Insufficient disk space: ${systemInfo.freeDiskSpaceGB}GB available, ${requirements.minDiskSpaceGB}GB required`);
            }

            // CUDA requirements
            if (requirements.cudaSupport) {
                if (!systemInfo.cudaAvailable) {
                    issues.push('CUDA support required but not available');
                } else if (requirements.minCudaVersion && systemInfo.cudaVersion) {
                    if (this.compareCudaVersions(systemInfo.cudaVersion, requirements.minCudaVersion) < 0) {
                        issues.push(`CUDA version ${requirements.minCudaVersion} required, but ${systemInfo.cudaVersion} found`);
                    }
                }
            }

            const result: ModelValidationResult = {
                isValid: issues.length === 0,
                issues,
                requirements
            };

            this.logValidationResult(model, result);
            return result;
        } catch (error) {
            this.handleError(new Error(`Validation failed for model ${model.id}: ${error instanceof Error ? error.message : String(error)}`));
            throw error;
        }
    }

    public async checkCompatibility(modelA: LLMModelInfo, modelB: LLMModelInfo): Promise<CompatibilityResult> {
        const issues: string[] = [];

        // Provider compatibility
        if (modelA.provider !== modelB.provider) {
            issues.push(`Different providers: ${modelA.provider} vs ${modelB.provider}`);
        }

        // Hardware requirements
        const reqA = this.inferModelRequirements(modelA);
        const reqB = this.inferModelRequirements(modelB);

        const memoryRequired = Math.max(reqA.minMemoryGB, reqB.minMemoryGB);
        const gpuRequired = reqA.requiresGPU || reqB.requiresGPU;
        const cpuCoresRequired = Math.max(reqA.minCPUCores, reqB.minCPUCores);
        const diskSpaceRequired = Math.max(reqA.minDiskSpaceGB, reqB.minDiskSpaceGB);

        const systemInfo = await this.getSystemInfo();

        if (systemInfo.totalMemoryGB < memoryRequired) {
            issues.push(`Insufficient memory for concurrent operation: ${systemInfo.totalMemoryGB}GB available, ${memoryRequired}GB required`);
        }

        if (gpuRequired && !systemInfo.gpuInfo?.available) {
            issues.push('GPU required for concurrent operation but not available');
        }

        if (systemInfo.cpuCores < cpuCoresRequired) {
            issues.push(`Insufficient CPU cores for concurrent operation: ${systemInfo.cpuCores} available, ${cpuCoresRequired} required`);
        }

        if (systemInfo.freeDiskSpaceGB < diskSpaceRequired) {
            issues.push(`Insufficient disk space for concurrent operation: ${systemInfo.freeDiskSpaceGB}GB available, ${diskSpaceRequired}GB required`);
        }

        return {
            isCompatible: issues.length === 0,
            issues
        };
    }

    private inferModelRequirements(model: LLMModelInfo): ModelRequirements {
        const parameters = model.parameters || 0;
        const requirements: ModelRequirements = {
            minMemoryGB: Math.max(4, Math.ceil(parameters * 1.5)),
            minCPUCores: Math.max(2, Math.ceil(parameters / 4)),
            minDiskSpaceGB: Math.max(2, Math.ceil(parameters * 0.5)),
            requiresGPU: parameters > 7,
            minGPUMemoryGB: parameters > 7 ? Math.ceil(parameters * 0.75) : undefined,
            cudaSupport: parameters > 7
        };

        if (parameters > 13) {
            requirements.minCudaVersion = '11.0';
        }

        return requirements;
    }

    private async getSystemInfo(): Promise<SystemInfo> {
        if (!this.systemRequirements) {
            // Implementation specific to getting system info
            // This would need platform-specific implementations
            this.systemRequirements = {
                totalMemoryGB: Math.round(require('os').totalmem() / (1024 * 1024 * 1024)),
                cpuCores: require('os').cpus().length,
                freeDiskSpaceGB: 100, // Placeholder - would need actual implementation
                cudaAvailable: false, // Placeholder - would need actual implementation
                gpuInfo: await this.getGPUInfo()
            };
        }
        return this.systemRequirements;
    }

    private async getGPUInfo(): Promise<{ available: boolean; memoryGB?: number } | undefined> {
        try {
            // Implementation would be platform-specific
            // This is a placeholder
            return {
                available: false,
                memoryGB: undefined
            };
        } catch (error) {
            this.logger.warn('Failed to get GPU information:', error);
            return undefined;
        }
    }

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

    private logValidationResult(model: LLMModelInfo, result: ModelValidationResult): void {
        this.outputChannel.appendLine(`\nValidation result for model ${model.id}:`);
        this.outputChannel.appendLine(`Valid: ${result.isValid}`);
        if (result.issues.length > 0) {
            this.outputChannel.appendLine('Issues:');
            result.issues.forEach(issue => this.outputChannel.appendLine(`- ${issue}`));
        }
        this.outputChannel.appendLine('Requirements:');
        Object.entries(result.requirements).forEach(([key, value]) => {
            this.outputChannel.appendLine(`- ${key}: ${value}`);
        });
    }

    private handleError(error: Error): void {
        this.logger.error('[ModelValidator]', error);
        this.emit('error', error);
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
    }
}
