import * as vscode from 'vscode';
import * as os from 'os';
import { LLMModelInfo } from '../llm-provider';
import { ModelRequirements, ModelValidationResult, SystemInfo } from '../types';

/**
 * Service for validating model compatibility with system capabilities
 */
export class ModelValidationService implements vscode.Disposable {
    private readonly validationCache = new Map<string, ModelValidationResult>();
    private systemInfo: SystemInfo | null = null;
    private readonly outputChannel: vscode.OutputChannel;

    constructor() {
        this.outputChannel = vscode.window.createOutputChannel('Model Validation');
    }

    /**
     * Validate a model against system capabilities
     */
    public async validateModel(modelInfo: LLMModelInfo): Promise<ModelValidationResult> {
        // Check cache first
        const cached = this.validationCache.get(modelInfo.id);
        if (cached) {
            return cached;
        }

        const requirements = this.inferModelRequirements(modelInfo);
        const issues: string[] = [];
        const systemInfo = await this.getSystemInfo();

        // Memory check
        if (systemInfo.totalMemoryGB < requirements.minMemoryGB) {
            issues.push(`Insufficient memory: ${systemInfo.totalMemoryGB}GB available, ${requirements.minMemoryGB}GB required`);
        }

        // Disk space check
        if (systemInfo.freeDiskSpaceGB < requirements.minDiskSpaceGB) {
            issues.push(`Insufficient disk space: ${systemInfo.freeDiskSpaceGB}GB available, ${requirements.minDiskSpaceGB}GB required`);
        }

        // CUDA support check
        if (requirements.cudaSupport) {
            if (!systemInfo.cudaAvailable) {
                issues.push('CUDA support required but not available');
            } else if (
                requirements.minCudaVersion &&
                systemInfo.cudaVersion &&
                this.compareCudaVersions(systemInfo.cudaVersion, requirements.minCudaVersion) < 0
            ) {
                issues.push(`CUDA version ${requirements.minCudaVersion} required, but ${systemInfo.cudaVersion} found`);
            }
        }

        // CPU cores check
        if (systemInfo.cpuCores < requirements.minCPUCores) {
            issues.push(`Insufficient CPU cores: ${systemInfo.cpuCores} available, ${requirements.minCPUCores} required`);
        }

        const result: ModelValidationResult = {
            isValid: issues.length === 0,
            issues,
            requirements
        };

        // Cache the validation result
        this.validationCache.set(modelInfo.id, result);
        this.logValidationResult(modelInfo, result);

        return result;
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
    private inferModelRequirements(modelInfo: LLMModelInfo): ModelRequirements {
        const parameters = modelInfo.parameters || 0;

        return {
            minMemoryGB: Math.max(4, Math.ceil(parameters * 2)),
            recommendedMemoryGB: Math.max(8, Math.ceil(parameters * 3)),
            minDiskSpaceGB: Math.max(2, Math.ceil(parameters * 0.5)),
            cudaSupport: parameters > 7,
            minCPUCores: Math.max(2, Math.ceil(parameters / 4))
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

    private logValidationResult(modelInfo: LLMModelInfo, result: ModelValidationResult): void {
        this.outputChannel.appendLine(`\nValidation result for model ${modelInfo.id}:`);
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
    }
}