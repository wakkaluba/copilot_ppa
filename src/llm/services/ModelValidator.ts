import { EventEmitter } from 'events';
import { injectable } from 'inversify';
import * as vscode from 'vscode';
import type { ILLMModelInfo, IModelRequirements, ISystemInfo } from '../types';
/**
 * Result of model validation.
 */
export interface IModelValidationResult {
  isValid: boolean;
  issues: string[];
  requirements: IModelRequirements;
}

type ModelValidationResult = IModelValidationResult;

/**
 * Result of compatibility check between two models.
 */
export interface ICompatibilityResult {
  isCompatible: boolean;
  issues: string[];
}

type CompatibilityResult = ICompatibilityResult;

@injectable()
export class ModelValidator extends EventEmitter implements vscode.Disposable {
    private readonly outputChannel: vscode.OutputChannel;
    private systemRequirements: ISystemInfo | null = null;

    constructor() {
        super();
        this.outputChannel = vscode.window.createOutputChannel('Model Validation');
    }

    public async validateModel(model: ILLMModelInfo): Promise<IModelValidationResult> {
      try {
        const requirements = this.inferModelRequirements(model);
        const systemInfo = await this.getSystemInfo();
        const issues: string[] = [];

        // Memory requirements
        if (systemInfo.totalRAM < requirements.minRAM) {
          issues.push(`Insufficient memory: ${systemInfo.totalRAM}MB available, ${requirements.minRAM}MB required`);
        }

        // GPU requirements
        if (requirements.gpu?.required) {
          if (!systemInfo.gpu) {
            issues.push('GPU required but not available');
          } else if (requirements.gpu.minVRAM && systemInfo.gpu.vram < requirements.gpu.minVRAM) {
            issues.push(`Insufficient GPU memory: ${systemInfo.gpu.vram}MB available, ${requirements.gpu.minVRAM}MB required`);
          }
        }

        // CPU requirements
        if (systemInfo.cpuSpeed < requirements.minCPU) {
          issues.push(`Insufficient CPU speed: ${systemInfo.cpuSpeed}MHz available, ${requirements.minCPU}MHz required`);
        }
        if (systemInfo.cpuCores < 1) {
          issues.push('No CPU cores detected');
        }

        // Disk space requirements
        if (systemInfo.freeDisk < requirements.minDisk) {
          issues.push(`Insufficient disk space: ${systemInfo.freeDisk}MB available, ${requirements.minDisk}MB required`);
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

    public async checkCompatibility(modelA: ILLMModelInfo, modelB: ILLMModelInfo): Promise<ICompatibilityResult> {
      const issues: string[] = [];
      if (modelA.provider !== modelB.provider) {
        issues.push(`Different providers: ${modelA.provider} vs ${modelB.provider}`);
      }
      const reqA = this.inferModelRequirements(modelA);
      const reqB = this.inferModelRequirements(modelB);
      const memoryRequired = Math.max(reqA.minRAM, reqB.minRAM);
      const cpuRequired = Math.max(reqA.minCPU, reqB.minCPU);
      const diskRequired = Math.max(reqA.minDisk, reqB.minDisk);
      return {
        isCompatible: issues.length === 0,
        issues
      };
    }
    private inferModelRequirements(model: ILLMModelInfo): IModelRequirements {
      return {
        minRAM: 1024,
        minCPU: 1000,
        minDisk: 1024,
        gpu: { required: false, minVRAM: 0 }
      };
    }
    private async getSystemInfo(): Promise<ISystemInfo> {
      // Stub: return default system info
      return {
        totalRAM: 8192,
        availableRAM: 8192,
        cpuSpeed: 2500,
        cpuCores: 4,
        totalDisk: 200000,
        freeDisk: 100000,
        gpu: { name: 'Generic GPU', vram: 4096 }
      };
    }
    private logValidationResult(model: ILLMModelInfo, result: IModelValidationResult): void {
      this.outputChannel.appendLine(`Validation result for model ${model.id}: ${result.isValid ? 'Valid' : 'Invalid'}`);
      if (result.issues.length) {
        result.issues.forEach(issue => this.outputChannel.appendLine(`- ${issue}`));
      }
    }
    private handleError(error: Error): void {
      this.outputChannel.appendLine(`Error: ${error.message}`);
    }

    dispose() {
      this.outputChannel.dispose();
    }
}
