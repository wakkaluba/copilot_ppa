import * as vscode from 'vscode';

export interface LLMPromptOptions {
    maxTokens?: number;
    temperature?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stopSequences?: string[];
}

export interface HardwareSpecs {
    gpu: {
        available: boolean;
        name?: string;
        vram?: number;
        cudaSupport?: boolean;
    };
    ram: {
        total: number;
        free: number;
    };
    cpu: {
        cores: number;
        model?: string;
    };
}

export interface ILLMModelService extends vscode.Disposable {
    initialize(): Promise<void>;
    clearConversation(): Promise<void>;
}

/**
 * Model requirements specification
 */
export interface ModelRequirements {
    minMemoryGB: number;
    recommendedMemoryGB: number;
    minDiskSpaceGB: number;
    cudaSupport: boolean;
    minCudaVersion?: string;
    minCPUCores: number;
}

/**
 * Result of model validation
 */
export interface ModelValidationResult {
    isValid: boolean;
    issues: string[];
    requirements: ModelRequirements;
}

/**
 * Model performance metrics
 */
export interface ModelPerformanceMetrics {
    averageResponseTime: number;
    tokenThroughput: number;
    errorRate: number;
    totalRequests: number;
    totalTokens: number;
    lastUsed: Date;
}

/**
 * System capabilities information
 */
export interface SystemInfo {
    totalMemoryGB: number;
    freeDiskSpaceGB: number;
    cpuCores: number;
    cudaAvailable: boolean;
    cudaVersion?: string | undefined;
}

/**
 * Events emitted by model services
 */
export interface ModelServiceEvents {
    modelRegistered: (modelId: string) => void;
    modelRemoved: (modelId: string) => void;
    modelUpdated: (modelId: string) => void;
    metricsUpdated: (modelId: string, metrics: ModelPerformanceMetrics) => void;
    validationUpdated: (modelId: string, validation: ModelValidationResult) => void;
}

/**
 * Model configuration options
 */
export interface ModelConfig {
    id: string;
    name: string;
    provider: string;
    enabled: boolean;
    priority?: number;
    options?: Record<string, unknown>;
}
