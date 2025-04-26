import * as vscode from 'vscode';
import { ConnectionState, ConnectionStateChangeEvent } from '../../types/llm';
import { ConnectionStatus, ModelInfo } from './interfaces';

/**
 * Reports LLM connection status to VS Code UI
 */
export class LLMStatusReporter {
    private static instance: LLMStatusReporter;
    private readonly statusBarItem: vscode.StatusBarItem;
    private readonly outputChannel: vscode.OutputChannel;
    private currentProvider?: string;
    private currentModel?: ModelInfo;

    private constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(
            vscode.StatusBarAlignment.Right,
            100
        );
        this.outputChannel = vscode.window.createOutputChannel('LLM Connection');
        this.setupStatusBarItem();
    }

    public static getInstance(): LLMStatusReporter {
        if (!this.instance) {
            this.instance = new LLMStatusReporter();
        }
        return this.instance;
    }

    /**
     * Update the displayed status
     */
    public updateStatus(status: ConnectionStatus, provider?: string): void {
        this.currentProvider = provider;
        this.currentModel = status.modelInfo;
        this.updateStatusBar(status.state);
        this.logStatus(status, provider);
    }

    /**
     * Report a connection state change
     */
    public reportStateChange(event: ConnectionStateChangeEvent, provider?: string): void {
        this.updateStatusBar(event.newState);
        this.logStateChange(event, provider);
    }

    /**
     * Report an error
     */
    public reportError(error: Error, provider?: string): void {
        const prefix = provider ? `[${provider}] ` : '';
        const message = `${prefix}Error: ${error.message}`;
        
        vscode.window.showErrorMessage(message);
        this.outputChannel.appendLine(`${new Date().toISOString()} - ${message}`);
        
        if (error.stack) {
            this.outputChannel.appendLine(error.stack);
        }
    }

    /**
     * Show connection details
     */
    public async showConnectionDetails(): Promise<void> {
        if (!this.currentProvider) {
            vscode.window.showInformationMessage('No active LLM connection');
            return;
        }

        const details = [
            `Provider: ${this.currentProvider}`,
            this.currentModel ? `Model: ${this.currentModel.name}` : 'No model loaded',
            this.currentModel?.capabilities?.length ? 
                `Capabilities: ${this.currentModel.capabilities.join(', ')}` : 
                'No capabilities info'
        ];

        const result = await vscode.window.showInformationMessage(
            details.join('\n'),
            'Show Logs'
        );

        if (result === 'Show Logs') {
            this.outputChannel.show();
        }
    }

    private setupStatusBarItem(): void {
        this.statusBarItem.command = 'llm.showConnectionDetails';
        this.updateStatusBar(ConnectionState.DISCONNECTED);
        this.statusBarItem.show();
    }

    private updateStatusBar(state: ConnectionState): void {
        const icons = {
            [ConnectionState.CONNECTED]: '$(link)',
            [ConnectionState.CONNECTING]: '$(sync~spin)',
            [ConnectionState.DISCONNECTED]: '$(unlink)',
            [ConnectionState.ERROR]: '$(warning)'
        };

        const provider = this.currentProvider ? ` - ${this.currentProvider}` : '';
        const model = this.currentModel ? ` (${this.currentModel.name})` : '';
        
        this.statusBarItem.text = `${icons[state]} LLM${provider}${model}`;
        this.statusBarItem.tooltip = `LLM Connection Status: ${state}${provider}${model}`;
    }

    private logStatus(status: ConnectionStatus, provider?: string): void {
        const timestamp = new Date().toISOString();
        const prefix = provider ? `[${provider}] ` : '';
        
        this.outputChannel.appendLine(
            `${timestamp} - ${prefix}Status: ${status.state}` +
            (status.modelInfo ? ` - Model: ${status.modelInfo.name}` : '') +
            (status.error ? `\nError: ${status.error.message}` : '')
        );
    }

    private logStateChange(event: ConnectionStateChangeEvent, provider?: string): void {
        const timestamp = new Date().toISOString();
        const prefix = provider ? `[${provider}] ` : '';
        
        this.outputChannel.appendLine(
            `${timestamp} - ${prefix}State changed: ${event.previousState} -> ${event.newState}`
        );
    }

    public dispose(): void {
        this.statusBarItem.dispose();
        this.outputChannel.dispose();
    }
}