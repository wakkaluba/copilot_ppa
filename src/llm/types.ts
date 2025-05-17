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
  topK?: number;
  presenceBonus?: number;
  frequencyBonus?: number;
  stopSequences?: string[];
  timeout?: number;
  stream?: boolean;
}

export enum LLMRequestPriority {
  Low = 'low',
  Normal = 'normal',
  High = 'high',
}

export enum LLMRequestStatus {
  Pending = 'pending',
  InProgress = 'in-progress',
  Completed = 'completed',
  Failed = 'failed',
  Cancelled = 'cancelled',
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
  done: boolean;
  error?: LLMResponseError;
  timestamp?: number;
  tokenCount?: number;
}

// Add ILLMMessage interface to match the one in services/llm/types.ts
export interface LLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
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
  MetricsAggregated = 'metrics:aggregated',
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
  maxContextLength: number;
  supportsChatCompletion: boolean;
  supportsStreaming: boolean;
  supportsSystemPrompts: boolean;
  supportedFormats: LLMResponseFormat[];
  multimodalSupport: boolean;
  supportsTemperature: boolean;
  supportsTopP: boolean;
  supportsPenalties: boolean;
  supportsRetries: boolean;
}

// Basic interface for LLM providers
export interface LLMProvider {
  id: string; // Added id property to match what LLMProviderManager expects
  getName(): string;
  getCapabilities(): ProviderCapabilities;
  isAvailable(): Promise<boolean>;
  getStatus(): 'active' | 'inactive' | 'error';
  completePrompt(request: LLMRequest): Promise<LLMResponse>;
  streamPrompt?(request: LLMRequest): AsyncIterable<LLMResponse>;
  cancelRequest(requestId: string): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions,
  ): Promise<LLMResponse>;
  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void,
  ): Promise<void>;

  // Add missing methods that the LLMProviderManager expects
  generateChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions,
  ): Promise<LLMResponse>;
  streamChatCompletion(
    model: string,
    messages: LLMMessage[],
    options?: LLMRequestOptions,
    callback?: (event: LLMStreamEvent) => void,
  ): Promise<void>;

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
  minRAM: number; // in MB
  minCPU: number; // in MHz
  minDisk: number; // in MB
  gpu?: {
    required: boolean;
    minVRAM?: number;
  };
}

export interface SystemInfo {
  totalRAM: number; // in MB
  availableRAM: number;
  cpuSpeed: number; // in MHz
  cpuCores: number;
  totalDisk: number; // in MB
  freeDisk: number;
  gpu?: {
    name: string;
    vram: number; // in MB
  };
}

export interface Logger {
  debug(message: string, ...args: any[]): void;
  info(message: string, ...args: any[]): void;
  warn(message: string, ...args: any[]): void;
  error(message: string | Error, ...args: any[]): void;
}
