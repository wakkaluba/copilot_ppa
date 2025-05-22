// Basic LLM types for the VS Code extension

export interface ILLMRequest {
  id: string;
  prompt: string;
  model: string;
  options?: ILLMRequestOptions;
  priority: ILLMRequestPriority;
  timestamp: number;
  status: ILLMRequestStatus;
  error?: ILLMRequestError;
}

export interface ILLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  [key: string]: unknown;
}

export enum ILLMRequestPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

export enum ILLMRequestStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
}

export interface ILLMRequestError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ILLMResponse {
  requestId: string;
  model: string;
  prompt: string;
  timestamp: number;
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type ILLMResponseFormat = 'text' | 'json' | 'markdown' | 'code';

export interface ILLMResponseOptions {
  format?: ILLMResponseFormat;
  includePrompt?: boolean;
  includeTokenUsage?: boolean;
}

export interface ILLMResponseError {
  code: string;
  message: string;
  details?: unknown;
}

export interface ILLMStreamEvent {
  content: string;
  done: boolean;
  error?: ILLMResponseError;
  timestamp?: number;
  tokenCount?: number;
}

export interface ILLMMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface ILLMModelInfo {
  id: string;
  name: string;
  provider: string;
  maxContextLength: number;
  parameters: {
    format: string;
    family: string;
    size?: number;
  };
  features: string[];
  metadata?: Record<string, unknown>;
}

export enum IModelEvents {
  EvaluationStarted = 'evaluation:started',
  EvaluationCompleted = 'evaluation:completed',
  OptimizationStarted = 'optimization:started',
  OptimizationCompleted = 'optimization:completed',
  OptimizationProgress = 'optimization:progress',
  SchedulingStarted = 'scheduling:started',
  SchedulingCompleted = 'scheduling:completed',
  ExecutionStarted = 'execution:started',
  ExecutionCompleted = 'execution:completed',
  TaskStarted = 'task:started',
  TaskCompleted = 'task:completed',
  TaskFailed = 'task:failed',
  TuningStarted = 'tuning:started',
  TuningCompleted = 'tuning:completed',
  TuningProgress = 'tuning:progress',
  MetricsUpdated = 'metrics:updated',
  MetricsExpired = 'metrics:expired',
  MetricsAggregated = 'metrics:aggregated',
}

export interface ILLMSessionConfig {
  model: string;
  provider: string;
  parameters: ILLMRequestOptions;
  contextSize: number;
  historySize: number;
  systemPrompt?: string;
}

export interface ISessionState {
  id: string;
  active: boolean;
  startTime: number;
  lastActivity: number;
  requestCount: number;
  tokenCount: number;
  model: string;
  provider: string;
}

export interface ISessionStats {
  totalRequests: number;
  totalTokens: number;
  averageResponseTime: number;
  errorRate: number;
}

export interface IProviderCapabilities {
  maxContextLength: number;
  supportsChatCompletion: boolean;
  supportsStreaming: boolean;
  supportsSystemPrompts: boolean;
  supportedFormats: ILLMResponseFormat[];
  multimodalSupport: boolean;
  supportsTemperature: boolean;
  supportsTopP: boolean;
  supportsPenalties: boolean;
  supportsRetries: boolean;
}

export interface ILLMProvider {
  id: string;
  getName(): string;
  getCapabilities(): IProviderCapabilities;
  isAvailable(): Promise<boolean>;
  getStatus(): 'active' | 'inactive' | 'error';
  completePrompt(request: ILLMRequest): Promise<ILLMResponse>;
  streamPrompt?(request: ILLMRequest): AsyncIterable<ILLMResponse>;
  cancelRequest(requestId: string): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse>;
  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void>;
  generateChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse>;
  streamChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void>;
  setOfflineMode(enabled: boolean): void;
  cacheResponse?(prompt: string, response: ILLMResponse): Promise<void>;
  useCachedResponse?(prompt: string): Promise<ILLMResponse | null>;
  isConnected(): boolean;
}

export interface ILLMPromptOptions {
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

export interface IModelRequirements {
  minRAM: number;
  minCPU: number;
  minDisk: number;
  gpu?: {
    required: boolean;
    minVRAM?: number;
  };
}

export interface ISystemInfo {
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

export interface ILogger {
  debug(message: string, ...args: unknown[]): void;
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string | Error, ...args: unknown[]): void;
}

export interface IModelInstance {
  id: string;
  status: string;
  allocation: IResourceAllocation;
  startTime: number;
  metrics: {
    requests: number;
    errors: number;
    latency: number;
  };
}

export interface IProvisioningEvent {
  modelId: string;
  instance?: IModelInstance;
  allocation?: IResourceAllocation;
  timestamp: Date;
}

export interface IResourceAllocation {
  memory: number;
  cpu: number;
  gpu: number;
  network: number;
}

export interface IModelPerformanceMetrics {
  modelId: string;
  averageResponseTime: number;
  tokenThroughput: number;
  errorRate: number;
  totalRequests: number;
  totalTokens: number;
  timestamp: number;
}
