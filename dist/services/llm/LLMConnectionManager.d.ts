import * as vscode from 'vscode';
import { EventEmitter } from 'events';
import { LLMProvider, ProviderCapabilities } from '../../llm/types';
export declare enum ConnectionStatus {
    Disconnected = "disconnected",
    Connecting = "connecting",
    Connected = "connected",
    Error = "error"
}
export interface ConnectionEvent {
    provider?: string;
    status: ConnectionStatus;
    timestamp: number;
    error?: Error;
    details?: Record<string, any>;
}
export declare class LLMConnectionManager extends EventEmitter implements vscode.Disposable {
    private provider;
    private status;
    private validator;
    private connectionTimeout;
    private connectionAttempts;
    private maxConnectionAttempts;
    constructor();
    /**
     * Set the LLM provider to use
     * @param provider The LLM provider implementation
     * @returns True if the provider was set successfully
     */
    setProvider(provider: LLMProvider): boolean;
    /**
     * Get the current LLM provider
     * @returns The current LLM provider or null if not set
     */
    getProvider(): LLMProvider | null;
    /**
     * Connect to the LLM provider
     * @returns True if connected successfully
     */
    connectToLLM(): Promise<boolean>;
    /**
     * Disconnect from the LLM provider
     */
    disconnectFromLLM(): void;
    /**
     * Get the current connection status
     * @returns The current connection status
     */
    getConnectionStatus(): ConnectionStatus;
    /**
     * Get the capabilities of the current provider
     * @returns The provider capabilities or null if no provider is set
     */
    getCapabilities(): ProviderCapabilities | null;
    /**
     * Set the connection timeout
     * @param timeoutMs Timeout in milliseconds
     */
    setConnectionTimeout(timeoutMs: number): void;
    /**
     * Set the maximum number of connection attempts
     * @param attempts Maximum number of attempts
     */
    setMaxConnectionAttempts(attempts: number): void;
    private setStatus;
    private withTimeout;
    dispose(): void;
}
