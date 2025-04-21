/**
 * LLM Factory - Creates and provides access to LLM services
 */
import * as vscode from 'vscode';
import { LLMConnectionManager } from './LLMConnectionManager';
import { LLMHostManager } from './LLMHostManager';
import { LLMSessionManager } from './LLMSessionManager';
import { LLMStreamProvider } from './LLMStreamProvider';
import { LLMConnectionOptions } from '../../types/llm';
import { LLMCommandHandlerService } from './services/LLMCommandHandlerService';
import { LLMProviderCreationService } from './services/LLMProviderCreationService';
import { LLMInitializationService } from './services/LLMInitializationService';

/**
 * Factory for accessing LLM services
 */
export class LLMFactory implements vscode.Disposable {
    private static instance: LLMFactory;
    private readonly connectionManager: LLMConnectionManager;
    private readonly hostManager: LLMHostManager;
    private readonly sessionManager: LLMSessionManager;
    private readonly commandHandler: LLMCommandHandlerService;
    private readonly providerCreator: LLMProviderCreationService;
    private readonly initService: LLMInitializationService;
    private readonly disposables: vscode.Disposable[] = [];
    
    /**
     * Creates a new LLM factory
     */
    private constructor(options: Partial<LLMConnectionOptions> = {}) {
        this.connectionManager = LLMConnectionManager.getInstance(options);
        this.hostManager = LLMHostManager.getInstance();
        this.sessionManager = LLMSessionManager.getInstance();
        
        this.commandHandler = new LLMCommandHandlerService(
            this.connectionManager,
            this.hostManager
        );
        this.providerCreator = new LLMProviderCreationService();
        this.initService = new LLMInitializationService(this.connectionManager);
        
        this.registerCommands();
    }
    
    /**
     * Gets the singleton instance of the LLM factory
     */
    public static getInstance(options: Partial<LLMConnectionOptions> = {}): LLMFactory {
        if (!this.instance) {
            this.instance = new LLMFactory(options);
        }
        return this.instance;
    }
    
    /**
     * Gets the connection manager
     */
    public getConnectionManager(): LLMConnectionManager {
        return this.connectionManager;
    }
    
    /**
     * Gets the host manager
     */
    public getHostManager(): LLMHostManager {
        return this.hostManager;
    }
    
    /**
     * Gets the session manager
     */
    public getSessionManager(): LLMSessionManager {
        return this.sessionManager;
    }
    
    /**
     * Creates a new stream provider
     */
    public createStreamProvider(endpoint?: string): LLMStreamProvider {
        return this.providerCreator.createStreamProvider(endpoint);
    }
    
    /**
     * Initializes the LLM services
     */
    public async initialize(): Promise<void> {
        await this.initService.initialize();
    }
    
    /**
     * Register commands related to LLM services
     */
    private registerCommands(): void {
        this.disposables.push(
            vscode.commands.registerCommand(
                'copilot-ppa.llm.connect',
                () => this.commandHandler.handleConnect()
            ),
            vscode.commands.registerCommand(
                'copilot-ppa.llm.disconnect',
                () => this.commandHandler.handleDisconnect()
            ),
            vscode.commands.registerCommand(
                'copilot-ppa.llm.restart',
                () => this.commandHandler.handleRestart()
            )
        );
    }
    
    /**
     * Disposes resources
     */
    public dispose(): void {
        this.disposables.forEach(d => d.dispose());
        this.commandHandler.dispose();
    }
}