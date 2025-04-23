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
    minRAM: number;
    minVRAM?: number;
    minCPUCores?: number;
    cudaRequired?: boolean;
    diskSpace?: number;
}

/**
 * Result of model validation
 */
export interface ModelValidationResult {
    isValid: boolean;
    issues: string[];
    warnings: string[];
    systemInfo: SystemInfo;
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
    maxTokens: number;
    temperature: number;
    topP: number;
    presencePenalty: number;
    frequencyPenalty: number;
    stopSequences: string[];
    [key: string]: any;
}

export interface LLMModelInfo {
    id: string;
    name: string;
    provider: 'ollama' | 'lmstudio' | 'huggingface';
    description: string;
    tags: string[];
    size?: number;
    parameters?: number;
    quantization?: string;
    contextLength?: number;
    config: ModelConfig;
    requirements: ModelRequirements;
}

export enum ModelEvent {
    ModelRegistered = 'modelRegistered',
    ModelRemoved = 'modelRemoved',
    ModelUpdated = 'modelUpdated',
    ActiveModelChanged = 'activeModelChanged',
    MetricsUpdated = 'metricsUpdated',
    ValidationUpdated = 'validationUpdated'
}

export type ModelLifecycleState = 
    | 'initial' 
    | 'loading'
    | 'ready'
    | 'error'
    | 'unloading'
    | 'unloaded';

export interface StateTransition {
    from: ModelLifecycleState;
    to: ModelLifecycleState;
    timestamp: number;
}

export interface ModelStateSnapshot {
    modelId: string;
    state: ModelLifecycleState;
    timestamp: number;
    transitions: StateTransition[];
}

export type ConfigUpdateEvent = {
    modelId: string;
    config: ModelConfig;
};

export type ConfigValidationError = {
    field: keyof ModelConfig;
    message: string;
};
