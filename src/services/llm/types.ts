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
    baseDelay: number;  // in milliseconds
    maxDelay: number;   // in milliseconds
    timeout: number;    // in milliseconds
    backoffFactor: number;
    currentAttempt: number;
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
    status: 'ok' | 'error';
    message?: string;
    models?: ModelInfo[];
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
    ProviderNotFound = 'PROVIDER_NOT_FOUND'
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