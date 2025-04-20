/**
 * Types and interfaces for the LLM connection system
 */

/**
 * Represents the connection state of the LLM service
 */
export enum ConnectionState {
    DISCONNECTED = 'disconnected',
    CONNECTING = 'connecting',
    CONNECTED = 'connected',
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
 * Connection options for the LLM service
 */
export interface LLMConnectionOptions {
    /** Maximum number of connection retries */
    maxRetries: number;
    
    /** Base delay in ms between retries */
    baseRetryDelay: number;
    
    /** Maximum delay in ms between retries */
    maxRetryDelay: number;
    
    /** Connection timeout in ms */
    connectionTimeout: number;
    
    /** Health check endpoint for LLM service */
    healthEndpoint: string;
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
 * Connection state change event
 */
export interface ConnectionStateChangeEvent {
    previousState: ConnectionState;
    currentState: ConnectionState;
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
 * Connection error event
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
    maxRetries: 5,
    baseRetryDelay: 1000,
    maxRetryDelay: 30000,
    connectionTimeout: 10000,
    healthEndpoint: 'http://localhost:11434/api/health'
};