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
    cpu: {
        cores: number;
        model: string;
        speed: number;
    };
    ram: {
        total: number;
        free: number;
    };
    gpu?: {
        name: string;
        memory: number;
        available?: boolean;
        vram?: number;
        cudaSupport?: boolean;
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
    provider: string;
    description: string;
    tags?: string[];
    contextSize?: number;
    parameters?: Record<string, any>;
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

// Model version interfaces
export interface ModelVersionMetadata {
    /**
     * Creation timestamp
     */
    createdAt?: string;
    
    /**
     * Optional checksum for the model version
     */
    checksum?: string;
    
    /**
     * Whether this version is a checkpoint
     */
    isCheckpoint?: boolean;
    
    /**
     * For rollbacks, the version it was rolled back from
     */
    rolledBackFrom?: string;
    
    /**
     * For checkpoints, the base version
     */
    checkpointBase?: string;
    
    /**
     * Any additional metadata properties
     */
    [key: string]: any;
}

export interface ModelVersionHistoryEntry {
    /**
     * The action that occurred
     */
    action: 'create' | 'update' | 'rollback' | 'checkpoint' | 'tag' | string;
    
    /**
     * If applicable, the version related to this action
     */
    fromVersion?: string;
    
    /**
     * Timestamp of the action
     */
    timestamp: string;
    
    /**
     * Any additional properties
     */
    [key: string]: any;
}

export interface ModelVersion {
    /**
     * The model identifier
     */
    modelId: string;
    
    /**
     * The version string
     */
    version: string;
    
    /**
     * Version metadata
     */
    metadata: ModelVersionMetadata;
    
    /**
     * Checksum of the model version
     */
    checksum: string;
    
    /**
     * Tags associated with this version
     */
    tags: string[];
    
    /**
     * Version history
     */
    history?: ModelVersionHistoryEntry[];
}

export interface ModelVersionChangeEvent {
    /**
     * The type of change
     */
    type: 'created' | 'updated' | 'rollback' | 'tagged' | 'untagged' | string;
    
    /**
     * The model identifier
     */
    modelId: string;
    
    /**
     * The version affected
     */
    version: string;
    
    /**
     * For rollbacks, the version it was rolled back from
     */
    fromVersion?: string;
    
    /**
     * For tagging operations, the tag
     */
    tag?: string;
    
    /**
     * Timestamp of the change
     */
    timestamp: string;
    
    /**
     * Any additional properties
     */
    [key: string]: any;
}

export enum ModelStatus {
    Available = 'available',
    Loading = 'loading',
    Error = 'error',
    NotFound = 'not-found'
}

export interface ModelStats {
    requestCount: number;
    averageResponseTime: number;
    errorCount: number;
    lastError?: string;
}

export interface ModelInfo extends LLMModelInfo {
    status: ModelStatus;
    stats?: ModelStats;
}
