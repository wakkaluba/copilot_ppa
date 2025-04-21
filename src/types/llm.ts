/**
 * Types and interfaces for LLM connection management
 */

/**
 * Connection states for LLM services
 */
export enum ConnectionState {
    CONNECTED = 'connected',
    CONNECTING = 'connecting',
    DISCONNECTED = 'disconnected',
    RECONNECTING = 'reconnecting',
    ERROR = 'error'
}

/**
 * Represents the state of the LLM host
 */
export enum HostState {
    STOPPED = 'stopped',
    STARTING = 'starting',
    RUNNING = 'running',
    ERROR = 'error'
}

/**
 * Options for LLM connections
 */
export interface LLMConnectionOptions {
    maxRetries: number;
    initialRetryDelay: number;
    maxRetryDelay: number;
    retryBackoffFactor: number;
    connectionTimeout: number;
    reconnectOnError: boolean;
    healthCheckInterval: number;
}

/**
 * LLM Host configuration
 */
export interface LLMHostConfig {
    /** Path to the LLM host executable */
    hostPath: string;
    
    /** Path to the model file */
    modelPath: string;
    
    /** Additional arguments for the host */
    additionalArgs?: string[];
}

/**
 * Event emitted when connection state changes
 */
export interface ConnectionStateChangeEvent {
    previousState: ConnectionState;
    newState: ConnectionState;
    timestamp: number;
}

/**
 * Host state change event
 */
export interface HostStateChangeEvent {
    previousState: HostState;
    currentState: HostState;
    timestamp: number;
}

/**
 * Event emitted when a connection error occurs
 */
export interface ConnectionErrorEvent {
    error: Error;
    connectionState: ConnectionState;
    retryCount: number;
    timestamp: number;
}

/**
 * Default connection options
 */
export const DEFAULT_CONNECTION_OPTIONS: LLMConnectionOptions = {
    maxRetries: 3,
    initialRetryDelay: 1000,
    maxRetryDelay: 30000,
    retryBackoffFactor: 2,
    connectionTimeout: 10000,
    reconnectOnError: true,
    healthCheckInterval: 30000
};