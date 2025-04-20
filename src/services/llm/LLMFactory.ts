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
export class LLMFactory implements vscode.Disposable {
    private static instance: LLMFactory;
    private _connectionManager: LLMConnectionManager;
    private _hostManager: LLMHostManager;
    private _sessionManager: LLMSessionManager;
    private _disposables: vscode.Disposable[] = [];
    
    /**
     * Creates a new LLM factory
     */
    private constructor(options: Partial<LLMConnectionOptions> = {}) {
        this._connectionManager = LLMConnectionManager.getInstance(options);
        this._hostManager = LLMHostManager.getInstance();
        this._sessionManager = LLMSessionManager.getInstance();
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
    public get connectionManager(): LLMConnectionManager {
        return this._connectionManager;
    }
    
    /**
     * Gets the host manager
     */
    public get hostManager(): LLMHostManager {
        return this._hostManager;
    }
    
    /**
     * Gets the session manager
     */
    public get sessionManager(): LLMSessionManager {
        return this._sessionManager;
    }
    
    /**
     * Creates a new stream provider
     */
    public createStreamProvider(endpoint?: string): LLMStreamProvider {
        return new LLMStreamProvider(endpoint);
    }
    
    /**
     * Initializes the LLM services
     */
    public async initialize(): Promise<void> {
        // Register commands
        this.registerCommands();
        
        // Try to connect if auto-connect is enabled
        if (this.getAutoConnectSetting()) {
            await this.connectionManager.connectToLLM().catch(err => {
                console.error('Auto-connect failed:', err);
            });
        }
    }
    
    /**
     * Register commands related to LLM services
     */
    private registerCommands(): void {
        this._disposables.push(
            vscode.commands.registerCommand('copilot-ppa.llm.connect', this.handleConnectCommand.bind(this)),
            vscode.commands.registerCommand('copilot-ppa.llm.disconnect', this.handleDisconnectCommand.bind(this)),
            vscode.commands.registerCommand('copilot-ppa.llm.restart', this.handleRestartCommand.bind(this))
        );
    }
    
    /**
     * Handle the connect command
     */
    private async handleConnectCommand(): Promise<void> {
        try {
            const connected = await this.connectionManager.connectToLLM();
            if (connected) {
                vscode.window.showInformationMessage('Successfully connected to LLM service');
            } else {
                vscode.window.showErrorMessage('Failed to connect to LLM service');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error connecting to LLM: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Handle the disconnect command
     */
    private async handleDisconnectCommand(): Promise<void> {
        try {
            await this.connectionManager.disconnect();
            vscode.window.showInformationMessage('Disconnected from LLM service');
        } catch (error) {
            vscode.window.showErrorMessage(`Error disconnecting from LLM: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Handle the restart command
     */
    private async handleRestartCommand(): Promise<void> {
        try {
            await this.hostManager.restartHost();
            const connected = await this.connectionManager.connectToLLM();
            if (connected) {
                vscode.window.showInformationMessage('LLM service restarted successfully');
            } else {
                vscode.window.showErrorMessage('LLM service restarted but connection failed');
            }
        } catch (error) {
            vscode.window.showErrorMessage(`Error restarting LLM service: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    
    /**
     * Get auto-connect setting
     */
    private getAutoConnectSetting(): boolean {
        return vscode.workspace.getConfiguration('copilot-ppa.llm').get<boolean>('autoConnect', true);
    }
    
    /**
     * Disposes resources
     */
    public dispose(): void {
        this._disposables.forEach(d => d.dispose());
        
        // The managers will be disposed when the extension deactivates
    }
}