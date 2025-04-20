import { EventEmitter } from 'events';

/**
 * Represents the current state of an LLM connection
 */
export type ConnectionState = 'connected' | 'connecting' | 'disconnected' | 'reconnecting' | 'error';

/**
 * Configuration for connection retries
 */
export interface RetryConfig {
    maxAttempts: number;
    baseDelay: number;  // in milliseconds
    maxDelay: number;   // in milliseconds
    timeout: number;    // in milliseconds
}

/**
 * LLM connection status
 */
export interface ConnectionStatus {
    state: ConnectionState;
    error?: Error;
    reconnectAttempt?: number;
    modelInfo?: ModelInfo;
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
    endpoint: string;
    model?: string;
    timeout?: number;
    retryConfig?: RetryConfig;
    authentication?: AuthConfig;
    parameters?: { [key: string]: any };
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
    ModelChanged = 'modelChanged'
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
    Timeout = 'TIMEOUT',
    InvalidEndpoint = 'INVALID_ENDPOINT',
    AuthenticationFailed = 'AUTHENTICATION_FAILED',
    ModelNotFound = 'MODEL_NOT_FOUND',
    InternalError = 'INTERNAL_ERROR'
}

/**
 * Custom error class for LLM connection errors
 */
export class LLMConnectionError extends Error {
    constructor(
        public readonly code: LLMConnectionErrorCode,
        message: string,
        public readonly cause?: Error
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