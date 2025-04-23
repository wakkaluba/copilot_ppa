import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { EventEmitter } from 'events';
import { ILogger } from '../types';
import { ModelRequirements, HardwareSpecs, LLMModelInfo } from '../types';

@injectable()
export class ModelCompatibilityManager extends EventEmitter implements vscode.Disposable {
    private readonly compatibilityCache = new Map<string, boolean>();
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger
    ) {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Compatibility');
    }

    public async checkModelCompatibility(
        model: LLMModelInfo,
        hardware: HardwareSpecs
    ): Promise<{ compatible: boolean; issues: string[] }> {
        try {
            const cacheKey = `${model.id}-${this.getHardwareHash(hardware)}`;
            if (this.compatibilityCache.has(cacheKey)) {
                return { 
                    compatible: this.compatibilityCache.get(cacheKey)!,
                    issues: []
                };
            }

            const requirements = this.inferModelRequirements(model);
            const issues: string[] = [];

            // Check RAM requirements
            if (hardware.ram.total < requirements.minRAM) {
                issues.push(`Insufficient RAM: ${hardware.ram.total}MB available, ${requirements.minRAM}MB required`);
            }

            // Check VRAM if GPU is required
            if (requirements.gpuRequired) {
                if (!hardware.gpu.available) {
                    issues.push('GPU required but not available');
                } else if (hardware.gpu.vram && hardware.gpu.vram < requirements.minVRAM!) {
                    issues.push(`Insufficient VRAM: ${hardware.gpu.vram}MB available, ${requirements.minVRAM}MB required`);
                }

                if (requirements.cudaRequired && !hardware.gpu.cudaSupport) {
                    issues.push('CUDA support required but not available');
                }
            }

            // Check CPU requirements
            if (hardware.cpu.cores < requirements.minCPUCores) {
                issues.push(`Insufficient CPU cores: ${hardware.cpu.cores} available, ${requirements.minCPUCores} required`);
            }

            const compatible = issues.length === 0;
            this.compatibilityCache.set(cacheKey, compatible);
            
            this.logCompatibilityCheck(model, hardware, compatible, issues);
            this.emit('compatibilityChecked', { modelId: model.id, compatible, issues });

            return { compatible, issues };
        } catch (error) {
            this.handleError('Failed to check model compatibility', error as Error);
            throw error;
        }
    }

    public async validateDependencies(modelId: string, dependencies: string[]): Promise<{
        valid: boolean;
        missing: string[];
    }> {
        try {
            const missing: string[] = [];
            for (const dep of dependencies) {
                try {
                    // This is a simplified check - in reality we would do proper version validation
                    await vscode.workspace.fs.stat(vscode.Uri.file(dep));
                } catch {
                    missing.push(dep);
                }
            }

            const valid = missing.length === 0;
            this.emit('dependenciesValidated', { modelId, valid, missing });

            return { valid, missing };
        } catch (error) {
            this.handleError('Failed to validate dependencies', error as Error);
            throw error;
        }
    }

    private inferModelRequirements(model: LLMModelInfo): ModelRequirements {
        const requirements: ModelRequirements = {
            minRAM: 4096,  // Base 4GB RAM requirement
            minCPUCores: 2 // Base 2 cores requirement
        };

        // Adjust requirements based on model parameters
        if (model.parameters) {
            if (model.parameters > 7) {
                requirements.gpuRequired = true;
                requirements.minVRAM = 6144; // 6GB VRAM for 7B+ models
                requirements.minRAM = 16384; // 16GB RAM for 7B+ models
                requirements.cudaRequired = true;
                requirements.minCPUCores = 4;
            } else if (model.parameters > 3) {
                requirements.minRAM = 8192; // 8GB RAM for 3B+ models
                requirements.minCPUCores = 4;
            }
        }

        // Adjust for quantization
        if (model.quantization) {
            const quantLevel = parseInt(model.quantization.replace(/[^\d]/g, ''));
            if (quantLevel <= 4) {
                requirements.minRAM = Math.max(requirements.minRAM / 2, 4096);
                if (requirements.minVRAM) {
                    requirements.minVRAM = Math.max(requirements.minVRAM / 2, 4096);
                }
            }
        }

        return requirements;
    }

    private getHardwareHash(hardware: HardwareSpecs): string {
        return JSON.stringify({
            ram: hardware.ram,
            gpu: hardware.gpu,
            cpu: hardware.cpu
        });
    }

    private logCompatibilityCheck(
        model: LLMModelInfo,
        hardware: HardwareSpecs,
        compatible: boolean,
        issues: string[]
    ): void {
        this.outputChannel.appendLine('\nModel Compatibility Check:');
        this.outputChannel.appendLine(`Model: ${model.id}`);
        this.outputChannel.appendLine(`Compatible: ${compatible}`);
        
        if (issues.length > 0) {
            this.outputChannel.appendLine('Issues:');
            issues.forEach(issue => this.outputChannel.appendLine(`- ${issue}`));
        }

        this.outputChannel.appendLine('Hardware:');
        this.outputChannel.appendLine(`- RAM: ${hardware.ram.total}MB`);
        if (hardware.gpu.available) {
            this.outputChannel.appendLine(`- GPU: ${hardware.gpu.name || 'Unknown'}`);
            this.outputChannel.appendLine(`- VRAM: ${hardware.gpu.vram || 'Unknown'}MB`);
            this.outputChannel.appendLine(`- CUDA: ${hardware.gpu.cudaSupport ? 'Yes' : 'No'}`);
        }
        this.outputChannel.appendLine(`- CPU Cores: ${hardware.cpu.cores}`);
        
        this.outputChannel.appendLine(`Timestamp: ${new Date().toISOString()}`);
    }

    private handleError(message: string, error: Error): void {
        this.logger.error('[ModelCompatibilityManager]', message, error);
        this.emit('error', error);
        this.outputChannel.appendLine(`\nError: ${message}`);
        this.outputChannel.appendLine(error.stack || error.message);
    }

    public clearCache(): void {
        this.compatibilityCache.clear();
        this.emit('cacheCleared');
    }

    public dispose(): void {
        this.outputChannel.dispose();
        this.removeAllListeners();
        this.compatibilityCache.clear();
    }
}
