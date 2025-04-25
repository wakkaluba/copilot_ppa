// Basic LLM types for the VS Code extension

export interface LLMRequest {
    id: string;
    prompt: string;
    model: string;
    options?: LLMRequestOptions;
    priority: LLMRequestPriority;
    timestamp: number;
    status: LLMRequestStatus;
    error?: LLMRequestError;
}

export interface LLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    topP?: number;
    presencePenalty?: number;
    frequencyPenalty?: number;
    stop?: string[];
    timeout?: number;
    stream?: boolean;
}

export enum LLMRequestPriority {
    Low = 'low',
    Normal = 'normal',
    High = 'high'
}

export enum LLMRequestStatus {
    Pending = 'pending',
    InProgress = 'in-progress',
    Completed = 'completed',
    Failed = 'failed',
    Cancelled = 'cancelled'
}

export interface LLMRequestError {
    code: string;
    message: string;
    details?: unknown;
}

export interface LLMResponse {
    id: string;
    requestId: string;
    content: string;
    model: string;
    prompt: string;
    timestamp: number;
    tokenUsage?: TokenUsage;
    format?: LLMResponseFormat;
    error?: LLMResponseError;
}

export type LLMResponseFormat = 'text' | 'json' | 'markdown' | 'code';

export interface LLMResponseOptions {
    format?: LLMResponseFormat;
    includePrompt?: boolean;
    includeTokenUsage?: boolean;
}

export interface LLMResponseError {
    code: string;
    message: string;
    details?: unknown;
}

export interface TokenUsage {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
}

export interface LLMRequestEvent {
    type: 'created' | 'started' | 'progress' | 'completed' | 'failed' | 'cancelled';
    request: LLMRequest;
    timestamp: number;
    details?: unknown;
}

// Model-related types
export enum ModelEvents {
    // Evaluation events
    EvaluationStarted = 'evaluation:started',
    EvaluationCompleted = 'evaluation:completed',
    
    // Optimization events
    OptimizationStarted = 'optimization:started',
    OptimizationCompleted = 'optimization:completed',
    OptimizationProgress = 'optimization:progress',
    
    // Scheduling events
    SchedulingStarted = 'scheduling:started',
    SchedulingCompleted = 'scheduling:completed',
    
    // Execution events
    ExecutionStarted = 'execution:started',
    ExecutionCompleted = 'execution:completed',
    
    // Task events
    TaskStarted = 'task:started',
    TaskCompleted = 'task:completed',
    TaskFailed = 'task:failed',
    
    // Tuning events
    TuningStarted = 'tuning:started',
    TuningCompleted = 'tuning:completed',
    TuningProgress = 'tuning:progress',
    
    // Metrics events
    MetricsUpdated = 'metrics:updated',
    MetricsExpired = 'metrics:expired',
    MetricsAggregated = 'metrics:aggregated'
}

export interface LLMSessionConfig {
    model: string;
    provider: string;
    parameters: LLMRequestOptions;
    contextSize: number;
    historySize: number;
    systemPrompt?: string;
}

export interface SessionState {
    id: string;
    active: boolean;
    startTime: number;
    lastActivity: number;
    requestCount: number;
    tokenCount: number;
    model: string;
    provider: string;
}

export interface SessionStats {
    totalRequests: number;
    totalTokens: number;
    averageResponseTime: number;
    errorRate: number;
}

// Provider capability types
export interface ProviderCapabilities {
    maxContextTokens: number;
    streamingSupport: boolean;
    supportedFormats: LLMResponseFormat[];
    multimodalSupport: boolean;
    supportsTemperature: boolean;
    supportsTopP: boolean;
    supportsPenalties: boolean;
    supportsRetries: boolean;
}

// Basic interface for LLM providers
export interface LLMProvider {
    getName(): string;
    getCapabilities(): ProviderCapabilities;
    isAvailable(): Promise<boolean>;
    getStatus(): 'active' | 'inactive' | 'error';
    completePrompt(request: LLMRequest): Promise<LLMResponse>;
    streamPrompt?(request: LLMRequest): AsyncIterable<LLMResponse>;
    cancelRequest(requestId: string): Promise<boolean>;
}
