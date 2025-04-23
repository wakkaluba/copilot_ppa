import { EventEmitter } from 'events';
import { ConnectionState, HostState, LLMConnectionOptions } from '../../types/llm';

/**
 * Error codes for LLM connection errors
 */
export enum ConnectionErrorCode {
    TIMEOUT = 'TIMEOUT',
    PROVIDER_UNAVAILABLE = 'PROVIDER_UNAVAILABLE',
    AUTHENTICATION_FAILED = 'AUTHENTICATION_FAILED',
    MODEL_NOT_FOUND = 'MODEL_NOT_FOUND',
    RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
    PROVIDER_ERROR = 'PROVIDER_ERROR',
    NETWORK_ERROR = 'NETWORK_ERROR',
    INVALID_RESPONSE = 'INVALID_RESPONSE',
    HOST_ERROR = 'HOST_ERROR',
    NO_ACTIVE_PROVIDER = 'NO_ACTIVE_PROVIDER',
    CONNECTION_FAILED = 'CONNECTION_FAILED',
    INVALID_ENDPOINT = 'INVALID_ENDPOINT',
    SERVICE_UNAVAILABLE = 'SERVICE_UNAVAILABLE'
}

/**
 * Health check response from provider
 */
export interface HealthCheckResponse {
    status: 'ok' | 'error';
    error?: string;
    models?: ModelInfo[];
    latency?: number;
    metadata?: Record<string, unknown>;
}

/**
 * Connection metrics for monitoring provider performance
 */
export interface ConnectionMetrics {
    successfulConnections: number;
    failedConnections: number;
    totalRequests: number;
    failedRequests: number;
    averageResponseTime: number;
    uptime: number;
    requestCount: number;
    errorCount: number;
    lastError?: Error;
    lastErrorTime?: number;
    lastSuccess?: Date;
}

/**
 * Model information
 */
export interface ModelInfo {
    id: string;
    name: string;
    provider: string;
    capabilities: string[];
    parameters?: Record<string, unknown>;
    contextLength?: number;
}

/**
 * Current connection status
 */
export interface ConnectionStatus {
    state: ConnectionState;
    message?: string;
    error?: Error;
    lastUpdate: Date;
    modelStatus?: ModelLoadStatus;
    metadata?: Record<string, unknown>;
}

/**
 * Model load status
 */
export interface ModelLoadStatus {
    isLoaded: boolean;
    progress?: number;
    stage?: string;
    error?: Error;
}

/**
 * Provider descriptor for registration and discovery
 */
export interface ProviderDescriptor {
    name: string;
    isAvailable: boolean;
    supportedModels: string[];
    metadata?: Record<string, unknown>;
}

/**
 * Provider capabilities
 */
export interface ProviderCapabilities {
    supportsStreaming: boolean;
    supportsCancellation: boolean;
    supportsModelSwitch: boolean;
    maxContextLength: number;
    supportedModels: string[];
}

/**
 * Host process information
 */
export interface HostProcessInfo {
    pid: number;
    memory: number;
    cpu: number;
    startTime: number;
    status: string;
}

/**
 * Health check result
 */
export interface HealthCheckResult {
    isHealthy: boolean;
    latency: number;
    timestamp: number;
    details?: {
        [key: string]: any;
    };
    error?: Error;
}

/**
 * Interface for LLM connection providers
 */
export interface ILLMConnectionProvider {
    connect(options: Record<string, unknown>): Promise<void>;
    disconnect(): Promise<void>;
    getStatus(): ConnectionStatus;
    isAvailable(): Promise<boolean>;
    getModelInfo(): Promise<ModelInfo | undefined>;
    getAvailableModels(): Promise<ModelInfo[]>;
    healthCheck(): Promise<HealthCheckResponse>;
}

/**
 * Events emitted by the connection manager
 */
export interface IConnectionManagerEvents {
    stateChanged: (event: ConnectionStateChangeEvent) => void;
    error: (event: ConnectionErrorEvent) => void;
    connected: () => void;
    disconnected: () => void;
}