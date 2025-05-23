import * as vscode from 'vscode';
import { ConnectionState, ConnectionStateChangeEvent } from '../../types/llm';
import { ILLMModelInfo as ILLMModelInfoBase } from './types';

/**
 * Reports LLM connection status to VS Code UI
 */
export class LLMStatusReporter {
  private static instance: LLMStatusReporter;
  private readonly statusBarItem: vscode.StatusBarItem;
  private readonly outputChannel: vscode.OutputChannel;
  private currentProvider?: string;
  private currentModel?: ILLMModelInfo;

  private constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
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
      Array.isArray(this.currentModel?.capabilities) && this.currentModel.capabilities.length
        ? `Capabilities: ${this.currentModel.capabilities.join(', ')}`
        : 'No capabilities info',
    ];

    const result = await vscode.window.showInformationMessage(details.join('\n'), 'Show Logs');
    if (result === 'Show Logs') {
      this.outputChannel.show();
    }
  }

  private setupStatusBarItem(): void {
    this.statusBarItem.command = 'llm.showConnectionDetails';
    this.updateStatusBar(ConnectionState.Disconnected);
    this.statusBarItem.show();
  }

  private updateStatusBar(state: ConnectionState): void {
    const icons: Record<ConnectionState, string> = {
      [ConnectionState.Connected]: '$(link)',
      [ConnectionState.Connecting]: '$(sync~spin)',
      [ConnectionState.Disconnected]: '$(unlink)',
      [ConnectionState.Error]: '$(warning)',
      [ConnectionState.Reconnecting]: '$(sync~spin)',
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
        (status.error ? `\nError: ${status.error.message}` : ''),
    );
  }

  private logStateChange(event: ConnectionStateChangeEvent, provider?: string): void {
    const timestamp = new Date().toISOString();
    const prefix = provider ? `[${provider}] ` : '';

    this.outputChannel.appendLine(
      `${timestamp} - ${prefix}State changed: ${event.previousState} -> ${event.newState}`,
    );
  }

  public dispose(): void {
    this.statusBarItem.dispose();
    this.outputChannel.dispose();
  }
}

// Patch: Extend ILLMModelInfo to include capabilities for UI display
interface ILLMModelInfo extends ILLMModelInfoBase {
  capabilities?: string[];
}

// Add ConnectionStatus type alias at the top

type ConnectionStatus = {
  state: ConnectionState;
  provider: string;
  modelInfo?: ILLMModelInfo;
  error?: Error;
};
