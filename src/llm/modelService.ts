import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import * as os from 'os';
import axios from 'axios';
import {
    LLMModelInfo,
    LLMProvider,
    LLMProviderError
} from './llm-provider';
import { ILLMModelService } from './types';

export interface ModelRequirements {
    minMemoryGB: number;
    recommendedMemoryGB: number;
    minDiskSpaceGB: number;
    cudaSupport: boolean;
    minCudaVersion?: string;
    minCPUCores: number;
}

export interface ModelValidationResult {
    isValid: boolean;
    issues: string[];
    requirements: ModelRequirements;
}

export interface ModelPerformanceMetrics {
    averageResponseTime: number;
    tokenThroughput: number;
    errorRate: number;
    totalRequests: number;
    totalTokens: number;
    lastUsed: Date;
}

/**
 * Service for managing LLM models
 */
export class ModelService implements vscode.Disposable {
    private readonly statusBarItem: vscode.StatusBarItem;
    private readonly outputChannel: vscode.OutputChannel;
    private readonly modelMetrics = new Map<string, ModelPerformanceMetrics>();
    private readonly modelValidations = new Map<string, ModelValidationResult>();
    private readonly eventEmitter = new EventEmitter();
    private _systemInfo: SystemInfo | null = null;

    constructor(context: vscode.ExtensionContext) {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.statusBarItem.command = 'copilot-ppa.configureModel';
        this.statusBarItem.tooltip = 'Configure LLM Model';
        
        this.outputChannel = vscode.window.createOutputChannel('LLM Models');
        
        context.subscriptions.push(
            this.statusBarItem,
            this.outputChannel,
            vscode.commands.registerCommand(
                'copilot-ppa.getModelRecommendations',
                this.getModelRecommendations.bind(this)
            ),
            vscode.commands.registerCommand(
                'copilot-ppa.checkModelCompatibility',
                this.checkModelCompatibility.bind(this)
            )
        );

        this.initialize().catch(error => {
            this.outputChannel.appendLine(`Failed to initialize model service: ${error}`);
        });
    }

    /**
     * Initialize the model service
     */
    private async initialize(): Promise<void> {
        this._systemInfo = await this.getSystemInfo();
        this.updateStatusBar();
    }

    /**
     * Get system information for model compatibility checks
     */
    private async getSystemInfo(): Promise<SystemInfo> {
        const totalMemory = os.totalmem() / (1024 * 1024 * 1024); // Convert to GB
        const freeDiskSpace = await this.getFreeDiskSpace();
        const cpuCores = os.cpus().length;
        const cudaInfo = await this.getCudaInfo();

        return {
            totalMemoryGB: Math.round(totalMemory),
            freeDiskSpaceGB: Math.round(freeDiskSpace),
            cpuCores,
            cudaAvailable: cudaInfo.available,
            cudaVersion: cudaInfo.version
        };
    }

    /**
     * Get available disk space
     */
    private async getFreeDiskSpace(): Promise<number> {
        // Implementation depends on platform
        // This is a placeholder that returns a reasonable default
        return 100; // GB
    }

    /**
     * Get CUDA information
     */
    private async getCudaInfo(): Promise<{ available: boolean; version?: string }> {
        // Implementation depends on platform
        // This is a placeholder that checks common CUDA locations
        return { available: false };
    }

    /**
     * Validate model requirements against system capabilities
     */
    public async validateModel(modelInfo: LLMModelInfo): Promise<ModelValidationResult> {
        // Check cache first
        if (this.modelValidations.has(modelInfo.id)) {
            return this.modelValidations.get(modelInfo.id)!;
        }

        const requirements = this.inferModelRequirements(modelInfo);
        const issues: string[] = [];

        // Check system capabilities
        const systemInfo = this._systemInfo || await this.getSystemInfo();

        if (systemInfo.totalMemoryGB < requirements.minMemoryGB) {
            issues.push(`Insufficient memory: ${systemInfo.totalMemoryGB}GB available, ${requirements.minMemoryGB}GB required`);
        }

        if (systemInfo.freeDiskSpaceGB < requirements.minDiskSpaceGB) {
            issues.push(`Insufficient disk space: ${systemInfo.freeDiskSpaceGB}GB available, ${requirements.minDiskSpaceGB}GB required`);
        }

        if (requirements.cudaSupport && !systemInfo.cudaAvailable) {
            issues.push('CUDA support required but not available');
        } else if (
            requirements.cudaSupport &&
            requirements.minCudaVersion &&
            systemInfo.cudaVersion &&
            this.compareCudaVersions(systemInfo.cudaVersion, requirements.minCudaVersion) < 0
        ) {
            issues.push(`CUDA version ${requirements.minCudaVersion} required, but ${systemInfo.cudaVersion} found`);
        }

        if (systemInfo.cpuCores < requirements.minCPUCores) {
            issues.push(`Insufficient CPU cores: ${systemInfo.cpuCores} available, ${requirements.minCPUCores} required`);
        }

        const result: ModelValidationResult = {
            isValid: issues.length === 0,
            issues,
            requirements
        };

        // Cache the validation result
        this.modelValidations.set(modelInfo.id, result);

        return result;
    }

    /**
     * Get model recommendations based on system capabilities
     */
    public async getModelRecommendations(): Promise<LLMModelInfo[]> {
        const systemInfo = this._systemInfo || await this.getSystemInfo();
        const recommendations: LLMModelInfo[] = [];

        // This would normally fetch from a model registry or configuration
        // This is a placeholder implementation
        if (systemInfo.totalMemoryGB >= 16) {
            recommendations.push({
                id: 'mistral-7b',
                name: 'Mistral (7B)',
                provider: 'ollama',
                parameters: 7,
                contextLength: 8192,
                capabilities: ['chat', 'completion']
            });
        }

        if (systemInfo.totalMemoryGB >= 8) {
            recommendations.push({
                id: 'llama2-7b-chat',
                name: 'Llama 2 Chat (7B)',
                provider: 'ollama',
                parameters: 7,
                contextLength: 4096,
                capabilities: ['chat']
            });
        }

        // Always include lightweight models
        recommendations.push({
            id: 'tiny-llama-1.1b',
            name: 'TinyLlama Chat (1.1B)',
            provider: 'ollama',
            parameters: 1.1,
            contextLength: 2048,
            capabilities: ['chat']
        });

        return recommendations;
    }

    /**
     * Check if a model is compatible with the current system
     */
    public async checkModelCompatibility(modelInfo: LLMModelInfo): Promise<boolean> {
        const validation = await this.validateModel(modelInfo);
        return validation.isValid;
    }

    /**
     * Track model performance metrics
     */
    public recordModelMetrics(
        modelId: string,
        responseTime: number,
        tokens: number,
        error?: boolean
    ): void {
        let metrics = this.modelMetrics.get(modelId);
        if (!metrics) {
            metrics = {
                averageResponseTime: 0,
                tokenThroughput: 0,
                errorRate: 0,
                totalRequests: 0,
                totalTokens: 0,
                lastUsed: new Date()
            };
            this.modelMetrics.set(modelId, metrics);
        }

        // Update metrics
        metrics.totalRequests++;
        metrics.totalTokens += tokens;
        metrics.lastUsed = new Date();

        // Update moving averages
        metrics.averageResponseTime = (
            (metrics.averageResponseTime * (metrics.totalRequests - 1)) +
            responseTime
        ) / metrics.totalRequests;

        metrics.tokenThroughput = metrics.totalTokens / 
            ((metrics.lastUsed.getTime() - metrics.lastUsed.getTime()) / 1000);

        if (error) {
            metrics.errorRate = (
                (metrics.errorRate * (metrics.totalRequests - 1)) +
                1
            ) / metrics.totalRequests;
        }

        this.eventEmitter.emit('metricsUpdated', modelId, metrics);
    }

    /**
     * Get performance metrics for a model
     */
    public getModelMetrics(modelId: string): ModelPerformanceMetrics | undefined {
        return this.modelMetrics.get(modelId);
    }

    /**
     * Infer model requirements based on model information
     */
    private inferModelRequirements(modelInfo: LLMModelInfo): ModelRequirements {
        const parameters = modelInfo.parameters || 0;
        
        // These are rough estimates and should be adjusted based on actual testing
        return {
            minMemoryGB: Math.max(4, Math.ceil(parameters * 2)),
            recommendedMemoryGB: Math.max(8, Math.ceil(parameters * 3)),
            minDiskSpaceGB: Math.max(2, Math.ceil(parameters * 0.5)),
            cudaSupport: parameters > 7,
            minCPUCores: Math.max(2, Math.ceil(parameters / 4))
        };
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
     * Update status bar with model information
     */
    private updateStatusBar(): void {
        // Implementation depends on active model
        this.statusBarItem.show();
    }

    public dispose(): void {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
        this.eventEmitter.removeAllListeners();
    }
}

interface SystemInfo {
    totalMemoryGB: number;
    freeDiskSpaceGB: number;
    cpuCores: number;
    cudaAvailable: boolean;
    cudaVersion?: string;
}