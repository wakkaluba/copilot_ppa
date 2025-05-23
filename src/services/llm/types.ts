import { EventEmitter } from 'events';

export interface ILLMMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ILLMRequestOptions {
  temperature?: number;
  maxTokens?: number;
  topK?: number;
  presenceBonus?: number;
  frequencyBonus?: number;
  stopSequences?: string[];
}

export interface ILLMResponse {
  content: string;
  usage: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ILLMStreamEvent {
  content: string;
  done: boolean;
}

export interface IProviderCapabilities {
  maxContextLength: number;
  supportsChatCompletion: boolean;
  supportsStreaming: boolean;
  supportsSystemPrompts: boolean;
}

export interface IProviderConfig {
  apiEndpoint: string;
  apiKey?: string;
  requestTimeout?: number;
  healthCheck?: {
    interval: number;
    timeout: number;
  };
}

export interface IHealthCheckResult {
  isHealthy: boolean;
  timestamp: number;
  details?: Record<string, unknown>;
}

export interface ILLMModelInfo {
  id: string;
  name: string;
  provider: string;
  maxContextLength: number;
  parameters: Record<string, unknown>;
  features: string[];
  metadata?: Record<string, unknown>;
}

export enum ProviderState {
  Unknown = 'unknown',
  Registered = 'registered',
  Initializing = 'initializing',
  Active = 'active',
  Deactivating = 'deactivating',
  Inactive = 'inactive',
  Error = 'error',
}

export interface IProviderStatus {
  state: ProviderState;
  activeModel?: string;
  error?: Error;
  lastHealthCheck?: IHealthCheckResult;
}

export interface ILLMProvider extends EventEmitter {
  readonly id: string;
  readonly name: string;

  isAvailable(): Promise<boolean>;
  connect(): Promise<void>;
  disconnect(): Promise<void>;
  getStatus(): IProviderStatus;
  getAvailableModels(): Promise<ILLMModelInfo[]>;
  getModelInfo(modelId: string): Promise<ILLMModelInfo>;
  getCapabilities(): Promise<IProviderCapabilities>;

  generateCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse>;

  generateChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
  ): Promise<ILLMResponse>;

  streamCompletion(
    model: string,
    prompt: string,
    systemPrompt?: string,
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void>;

  streamChatCompletion(
    model: string,
    messages: ILLMMessage[],
    options?: ILLMRequestOptions,
    callback?: (event: ILLMStreamEvent) => void,
  ): Promise<void>;
}

// --- LLM/Connection Types for Compatibility ---

export interface IConnectionEventData {
  type: string;
  payload?: unknown;
  timestamp: number;
}

export interface IConnectionEvent {
  event: string;
  data: IConnectionEventData;
}

export interface IHealthCheckResponse {
  isHealthy: boolean;
  details?: Record<string, unknown>;
  timestamp: number;
}

export enum ConnectionState {
  Connected = 'connected',
  Connecting = 'connecting',
  Disconnected = 'disconnected',
  Error = 'error',
}

export interface IModelInfo {
  id: string;
  name: string;
  provider: string;
  maxContextLength: number;
  parameters: Record<string, unknown>;
  features: string[];
  metadata?: Record<string, unknown>;
}

export interface IRetryConfig {
  maxRetries: number;
  retryDelay: number;
}

export class LLMConnectionError extends Error {
  code: LLMConnectionErrorCode;
  constructor(message: string, code: LLMConnectionErrorCode) {
    super(message);
    this.code = code;
    this.name = 'LLMConnectionError';
  }
}

export enum LLMConnectionErrorCode {
  Timeout = 'timeout',
  Network = 'network',
  Unauthorized = 'unauthorized',
  Unknown = 'unknown',
}

export interface IHealthCheckConfig {
  interval: number;
  timeout: number;
}

export interface IProviderCapabilitiesCompat extends IProviderCapabilities {}
export interface IProviderStatusCompat extends IProviderStatus {}

// LLM Core Types and Interfaces
// All interfaces and enums are already exported above. No need to re-export.
