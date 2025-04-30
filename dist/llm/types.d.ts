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
export declare enum LLMRequestPriority {
    Low = "low",
    Normal = "normal",
    High = "high"
}
export declare enum LLMRequestStatus {
    Pending = "pending",
    InProgress = "in-progress",
    Completed = "completed",
    Failed = "failed",
    Cancelled = "cancelled"
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
export interface LLMStreamEvent {
    content: string;
    isComplete?: boolean;
    error?: LLMResponseError;
    timestamp?: number;
    tokenCount?: number;
}
export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}
export declare enum ModelEvents {
    EvaluationStarted = "evaluation:started",
    EvaluationCompleted = "evaluation:completed",
    OptimizationStarted = "optimization:started",
    OptimizationCompleted = "optimization:completed",
    OptimizationProgress = "optimization:progress",
    SchedulingStarted = "scheduling:started",
    SchedulingCompleted = "scheduling:completed",
    ExecutionStarted = "execution:started",
    ExecutionCompleted = "execution:completed",
    TaskStarted = "task:started",
    TaskCompleted = "task:completed",
    TaskFailed = "task:failed",
    TuningStarted = "tuning:started",
    TuningCompleted = "tuning:completed",
    TuningProgress = "tuning:progress",
    MetricsUpdated = "metrics:updated",
    MetricsExpired = "metrics:expired",
    MetricsAggregated = "metrics:aggregated"
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
export interface LLMProvider {
    id: string;
    getName(): string;
    getCapabilities(): ProviderCapabilities;
    isAvailable(): Promise<boolean>;
    getStatus(): 'active' | 'inactive' | 'error';
    completePrompt(request: LLMRequest): Promise<LLMResponse>;
    streamPrompt?(request: LLMRequest): AsyncIterable<LLMResponse>;
    cancelRequest(requestId: string): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    generateCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions): Promise<LLMResponse>;
    streamCompletion(model: string, prompt: string, systemPrompt?: string, options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    generateChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions): Promise<LLMResponse>;
    streamChatCompletion(model: string, messages: LLMMessage[], options?: LLMRequestOptions, callback?: (event: LLMStreamEvent) => void): Promise<void>;
    setOfflineMode(enabled: boolean): void;
    cacheResponse?(prompt: string, response: LLMResponse): Promise<void>;
    useCachedResponse?(prompt: string): Promise<LLMResponse | null>;
    isConnected(): boolean;
}
export interface LLMPromptOptions {
    temperature?: number;
    maxTokens?: number;
    language?: string;
    context?: string;
    formatOptions?: {
        style?: string;
        format?: string;
        language?: string;
    };
}
export interface LLMModelInfo {
    id: string;
    name: string;
    provider: string;
    description?: string;
    contextSize?: number;
    parameters?: Record<string, any>;
    tags?: string[];
    version?: string;
    capabilities?: string[];
    quantization?: string;
    license?: string;
    minMemoryGB?: number;
    recommendedMemoryGB?: number;
    cudaSupport?: boolean;
}
export interface ModelRequirements {
    minRAM: number;
    minCPU: number;
    minDisk: number;
    gpu?: {
        required: boolean;
        minVRAM?: number;
    };
}
export interface SystemInfo {
    totalRAM: number;
    availableRAM: number;
    cpuSpeed: number;
    cpuCores: number;
    totalDisk: number;
    freeDisk: number;
    gpu?: {
        name: string;
        vram: number;
    };
}
