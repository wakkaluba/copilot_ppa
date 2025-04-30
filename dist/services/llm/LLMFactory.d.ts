/**
 * LLM Factory - Creates and provides access to LLM services
 */
import * as vscode from 'vscode';
import { LLMConnectionManager } from './LLMConnectionManager';
import { LLMHostManager } from './LLMHostManager';
import { LLMSessionManager } from './LLMSessionManager';
import { LLMStreamProvider } from './LLMStreamProvider';
import { LLMConnectionOptions } from '../../types/llm';
/**
 * Factory for accessing LLM services
 */
export declare class LLMFactory implements vscode.Disposable {
    private static instance;
    private readonly connectionManager;
    private readonly hostManager;
    private readonly sessionManager;
    private readonly commandHandler;
    private readonly providerCreator;
    private readonly initService;
    private readonly disposables;
    /**
     * Creates a new LLM factory
     */
    private constructor();
    /**
     * Gets the singleton instance of the LLM factory
     */
    static getInstance(options?: Partial<LLMConnectionOptions>): LLMFactory;
    /**
     * Gets the connection manager
     */
    getConnectionManager(): LLMConnectionManager;
    /**
     * Gets the host manager
     */
    getHostManager(): LLMHostManager;
    /**
     * Gets the session manager
     */
    getSessionManager(): LLMSessionManager;
    /**
     * Creates a new stream provider
     */
    createStreamProvider(endpoint?: string): LLMStreamProvider;
    /**
     * Initializes the LLM services
     */
    initialize(): Promise<void>;
    /**
     * Register commands related to LLM services
     */
    private registerCommands;
    /**
     * Disposes resources
     */
    dispose(): void;
}
