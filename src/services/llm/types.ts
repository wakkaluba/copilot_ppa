import { EventEmitter } from 'events';
import { Error } from './errors';

/**
 * Represents the current state of an LLM connection
 */
export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'error' | 'reconnecting';

/**
 * Configuration for connection retries
 */
export interface RetryConfig {
    maxAttempts: number;
    initialDelayMs: number;
    maxDelayMs: number;
    backoffFactor: number;
}

/**
 * LLM connection status
 */
export interface ConnectionStatus {
    isConnected: boolean;
    isAvailable: boolean;
    error: string;
}

/**
 * Information about an LLM model
 */
export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    capabilities: string[];
    parameters?: Record<string, unknown>;
    version?: string;
}

/**
 * Connection options for LLM
 */
export interface ConnectionOptions {
    endpoint?: string;
    model?: string;
    healthCheckInterval?: number;
    timeout?: number;
    retryConfig?: RetryConfig;
}

/**
 * Authentication configuration for LLM connection
 */
export interface AuthConfig {
    type: 'none' | 'basic' | 'bearer' | 'api-key';
    token?: string;
    username?: string;
    password?: string;
    apiKey?: string;
}

/**
 * LLM connection events
 */
export enum ConnectionEvent {
    Connected = 'connected',
    Disconnected = 'disconnected',
    Reconnecting = 'reconnecting',
    Error = 'error',
    StateChanged = 'stateChanged',
    ModelChanged = 'modelChanged',
    HealthCheckFailed = 'healthCheckFailed'
}

/**
 * Event data for connection state changes
 */
export interface ConnectionEventData {
    state: ConnectionState;
    timestamp: Date;
    error?: Error;
    modelInfo?: ModelInfo;
}

/**
 * Health check response from LLM service
 */
export interface HealthCheckResponse {
    status: ProviderStatus;
    latencyMs: number;
    metadata?: Record<string, unknown>;
}

/**
 * Error codes specific to LLM connections
 */
export enum LLMConnectionErrorCode {
    ConnectionFailed = 'CONNECTION_FAILED',
    InvalidEndpoint = 'INVALID_ENDPOINT',
    ModelNotFound = 'MODEL_NOT_FOUND',
    HealthCheckFailed = 'HEALTH_CHECK_FAILED',
    AuthenticationFailed = 'AUTHENTICATION_FAILED',
    Timeout = 'TIMEOUT',
    ProviderNotFound = 'PROVIDER_NOT_FOUND',
    InvalidConfiguration = 'INVALID_CONFIGURATION',
    NetworkError = 'NETWORK_ERROR'
}

/**
 * Custom error class for LLM connection errors
 */
export class LLMConnectionError extends Error {
    constructor(
        public readonly code: LLMConnectionErrorCode,
        message: string
    ) {
        super(message);
        this.name = 'LLMConnectionError';
    }
}

/**
 * Interface for classes that manage LLM connections
 */
export interface LLMConnectionProvider {
    connect(options: ConnectionOptions): Promise<void>;
    disconnect(): Promise<void>;
    getStatus(): ConnectionStatus;
    getModelInfo(): ModelInfo | undefined;
    onStateChanged(listener: (status: ConnectionStatus) => void): void;
    healthCheck(): Promise<HealthCheckResponse>;
}

/**
 * Connection metrics for LLM
 */
export interface ConnectionMetrics {
    totalRequests: number;
    successfulRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    lastResponseTime: number;
    uptime: number;
    totalTokens: number;
    errorRates: Map<string, number>;
    resourceUsage: {
        memory: number;
        cpu: number;
    };
    estimatedCost: number;
}

/**
 * Provider descriptor for LLM
 */
export interface ProviderDescriptor {
    name: string;
    displayName: string;
    description: string;
    capabilities: string[];
    defaultModel?: string;
}

/**
 * LLM provider status
 */
export interface LLMProviderStatus {
    isConnected: boolean;
    isAvailable: boolean;
    error: string;
    metadata?: {
        modelInfo?: ModelInfo;
        [key: string]: unknown;
    };
}

/**
 * Retry options for connection retries
 */
export interface RetryOptions {
    maxAttempts: number;
    initialDelay: number;
    maxDelay: number;
}

/**
 * Connection state change event
 */
export interface ConnectionStateChangeEvent extends ConnectionEventData {
    previousState: ConnectionState;
    currentState: ConnectionState;
    duration: number;
}

/**
 * Connection error event
 */
export interface ConnectionErrorEvent {
    error: Error;
    retryCount: number;
    timestamp: number;
    isRetryable: boolean;
}

/**
 * Provider status
 */
export enum ProviderStatus {
    HEALTHY = 'HEALTHY',
    UNHEALTHY = 'UNHEALTHY',
    UNKNOWN = 'UNKNOWN'
}

/**
 * Health check configuration
 */
export interface HealthCheckConfig {
    checkIntervalMs: number;
    timeoutMs: number;
    healthyThreshold: number;
    unhealthyThreshold: number;
}

/**
 * Provider health information
 */
export interface ProviderHealth {
    status: ProviderStatus;
    lastCheck: number;
    lastSuccess: number;
    consecutiveFailures: number;
    consecutiveSuccesses: number;
    totalChecks: number;
    error?: Error;
}

export interface LLMProvider extends EventEmitter {
    id: string;
    name: string;
    getCapabilities(): Promise<ProviderCapabilities>;
    isAvailable(): Promise<boolean>;
    connect(): Promise<void>;
    disconnect(): Promise<void>;
    getStatus(): ProviderStatus;
    getAvailableModels(): Promise<LLMModelInfo[]>;
    getModelInfo(modelId: string): Promise<LLMModelInfo>;
    generateCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;
    generateChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions
    ): Promise<LLMResponse>;
    streamCompletion(
        model: string,
        prompt: string,
        systemPrompt?: string,
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;
    streamChatCompletion(
        model: string,
        messages: LLMMessage[],
        options?: LLMRequestOptions,
        callback?: (event: LLMStreamEvent) => void
    ): Promise<void>;
    healthCheck(): Promise<HealthCheckResult>;
    dispose(): Promise<void>;
}

export interface ProviderConfig {
    apiEndpoint: string;
    connection?: {
        timeout: number;
        retries?: number;
        poolSize?: number;
    };
    model?: {
        name: string;
        contextLength?: number;
    };
    requestDefaults?: {
        temperature?: number;
        maxTokens?: number;
        topP?: number;
        frequencyPenalty?: number;
        presencePenalty?: number;
        stop?: string[];
    };
    healthCheck?: {
        interval: number;
        timeout: number;
        healthyThreshold?: number;
        unhealthyThreshold?: number;
    };
    auth?: {
        type: 'none' | 'basic' | 'bearer' | 'api-key';
        token?: string;
        username?: string;
        password?: string;
        apiKey?: string;
    };
}

export interface ProviderCapabilities {
    supportsStreaming: boolean;
    supportsCancellation: boolean;
    supportsModelSwitch: boolean;
    maxContextLength: number;
    supportedModels: string[];
    supportedFeatures?: string[];
}

export interface ProviderStatus {
    isConnected: boolean;
    isAvailable: boolean;
    state: ProviderState;
    error?: string;
    lastError?: Error;
    metadata?: Record<string, unknown>;
}

export interface ProviderMetrics {
    requestCount: number;
    successCount: number;
    errorCount: number;
    tokenUsage: number;
    averageResponseTime: number;
    requestTimes: Array<{
        timestamp: number;
        duration: number;
    }>;
    lastUpdated: number;
    lastError?: Error;
}

export interface LLMModelInfo {
    id: string;
    name: string;
    provider: string;
    contextLength: number;
    parameters?: Record<string, unknown>;
    version?: string;
    capabilities?: string[];
}

export interface LLMMessage {
    role: 'system' | 'user' | 'assistant';
    content: string;
}

export interface LLMResponse {
    content: string;
    usage?: {
        promptTokens: number;
        completionTokens: number;
        totalTokens: number;
    };
    metadata?: Record<string, any>;
}

export interface LLMStreamEvent {
    content: string;
    isComplete: boolean;
}

export interface LLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    metadata?: Record<string, any>;
}

export interface LLMRequestMetadata {
    requestStartTime?: number;
    responseTime?: number;
    tokenCount?: number | null;
    [key: string]: any;
}

export interface LLMRequestOptions {
    temperature?: number;
    maxTokens?: number;
    stopSequences?: string[];
    metadata?: Record<string, any>;
}

export interface HealthCheckResult {
    isHealthy: boolean;
    latency: number;
    timestamp: number;
    details?: Record<string, unknown>;
    error?: Error;
}

export enum ProviderState {
    Unknown = 'unknown',
    Registered = 'registered',
    Initializing = 'initializing',
    Active = 'active',
    Error = 'error',
    Deactivating = 'deactivating',
    Inactive = 'inactive',
    Unregistered = 'unregistered'
}

export enum ProviderConnectionState {
    Available = 'available',
    Active = 'active',
    Error = 'error'
}

export enum ProviderEvent {
    Registered = 'provider:registered',
    Initialized = 'provider:initialized',
    StateChanged = 'provider:stateChanged',
    ConnectionStateChanged = 'provider:connectionStateChanged',
    HealthStatusUpdated = 'provider:healthStatusUpdated',
    MetricsUpdated = 'provider:metricsUpdated',
    Deactivated = 'provider:deactivated',
    Unregistered = 'provider:unregistered'
}

export interface ProviderHealthStatus {
    isHealthy: boolean;
    lastCheck: number;
    consecutiveFailures?: number;
    consecutiveSuccesses?: number;
    details?: Record<string, unknown>;
}

export class ProviderError extends Error {
    constructor(
        message: string,
        public readonly providerId: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'ProviderError';
    }
}

export enum ChatRole {
    User = 'user',
    Assistant = 'assistant',
    System = 'system'
}

export enum ChatState {
    Active = 'active',
    Ended = 'ended',
    Error = 'error'
}

export enum ChatEvent {
    MessageSent = 'messageSent',
    MessageHandled = 'messageHandled',
    SessionCreated = 'sessionCreated',
    SessionEnded = 'sessionEnded',
    SessionResumed = 'sessionResumed',
    HistoryLoaded = 'historyLoaded',
    HistorySaved = 'historySaved',
    HistoryCleared = 'historyCleared',
    Error = 'error'
}

export interface ChatErrorEvent {
    error: unknown;
    sessionId?: string;
}

export interface ChatMessageMetadata {
    [key: string]: any;
    responseTime?: number;
    tokenCount?: number | null;
}

export interface ChatMessage {
    id: string;
    role: ChatRole;
    content: string;
    timestamp: number;
    metadata: ChatMessageMetadata;
}

export interface ChatSession {
    id: string;
    state: ChatState;
    messages: ChatMessage[];
    context: ChatContext;
    metadata: {
        createdAt: number;
        endedAt?: number;
        lastMessage: ChatMessage | null;
        messageCount: number;
        errorCount?: number;
        lastError?: Error;
        [key: string]: any;
    };
}

export interface ChatContext {
    systemPrompt?: string;
    variables?: Record<string, string>;
    [key: string]: any;
}

export interface ChatOptions {
    context?: ChatContext;
    metadata?: Record<string, any>;
}

export interface MessageOptions {
    role?: ChatRole;
    context?: ChatContext;
    [key: string]: any;
}

export interface ChatMetrics {
    totalSessions: number;
    activeSessions: number;
    totalMessages: number;
    averageResponseTime: number;
    errorRate: number;
}

export interface ChatHistoryOptions {
    maxMessagesPerSession?: number;
    pruneInterval?: number;
    retentionPeriod?: number;
}

export interface ChatFormatOptions {
    systemPromptPrefix?: string;
    maxContextMessages?: number;
    useMarkdown?: boolean;
    preserveFormatting?: boolean;
    [key: string]: any;
}

export class ChatError extends Error {
    constructor(
        message: string,
        public readonly sessionId?: string,
        public readonly cause?: Error
    ) {
        super(message);
        this.name = 'ChatError';
    }
}