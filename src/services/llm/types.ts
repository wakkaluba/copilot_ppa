import { EventEmitter } from 'events';
import { Error } from './errors';
import { LLMProvider } from '../../llm/llm-provider';

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
    lastError?: Error;
    lastErrorTime?: Date;
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
    initialize(config: ProviderConfig): Promise<void>;
    dispose(): Promise<void>;
    ping(): Promise<boolean>;
    getCapabilities(): Promise<ProviderCapabilities>;
}

export interface ProviderInfo {
    id: string;
    name: string;
    version: string;
    capabilities: ProviderCapabilities;
}

export enum ProviderEvent {
    Registered = 'registered',
    Unregistered = 'unregistered',
    Initialized = 'initialized',
    Deactivated = 'deactivated',
    StateChanged = 'stateChanged',
    HealthChanged = 'healthChanged',
    MetricsUpdated = 'metricsUpdated',
    ConnectionStateChanged = 'connectionStateChanged'
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

export enum ProviderState {
    Unknown = 'unknown',
    Registered = 'registered',
    Unregistered = 'unregistered',
    Initializing = 'initializing',
    Active = 'active',
    Inactive = 'inactive',
    Deactivating = 'deactivating',
    Error = 'error'
}

export interface ProviderCapabilities {
    maxTokens: number;
    supportedModels: string[];
    supportsStreaming: boolean;
    supportsCompletion: boolean;
    supportsChatCompletion: boolean;
}

export interface ProviderMetrics {
    requestCount: number;
    successCount: number;
    errorCount: number;
    tokenUsage: number;
    averageResponseTime: number;
    lastError: Error | null;
}

export interface ProviderConfig {
    apiKey?: string;
    baseUrl?: string;
    modelName?: string;
    maxTokens?: number;
    temperature?: number;
    timeout?: number;
    retryOptions?: {
        maxRetries: number;
        delayMs: number;
    };
}

export interface ProviderHealthStatus {
    status: 'healthy' | 'unhealthy' | 'error' | 'unknown';
    lastChecked: number;
    errorCount: number;
    lastError: Error | null;
}

export enum ProviderConnectionState {
    Connected = 'connected',
    Disconnected = 'disconnected',
    Connecting = 'connecting',
    Error = 'error'
}