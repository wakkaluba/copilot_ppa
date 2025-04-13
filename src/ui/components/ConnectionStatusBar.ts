import * as vscode from 'vscode';

/**
 * Status types for the LLM connection
 */
export enum ConnectionStatus {
  Disconnected = 'Disconnected',
  Connecting = 'Connecting',
  Connected = 'Connected',
  Error = 'Error'
}

/**
 * A class that manages the status bar item for displaying LLM connection status
 */
export class ConnectionStatusBar {
  private statusBarItem: vscode.StatusBarItem;
  private status: ConnectionStatus = ConnectionStatus.Disconnected;

  constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
    this.updateStatus(ConnectionStatus.Disconnected);
    this.statusBarItem.show();
  }

  /**
   * Update the connection status display
   * @param newStatus The new connection status
   * @param message Optional additional message to display
   */
  public updateStatus(newStatus: ConnectionStatus, message?: string): void {
    this.status = newStatus;
    
    // Set icon based on status
    switch (newStatus) {
      case ConnectionStatus.Connected:
        this.statusBarItem.text = `$(check) LLM: Connected`;
        this.statusBarItem.tooltip = message || 'Connected to LLM service';
        this.statusBarItem.backgroundColor = undefined;
        break;
      case ConnectionStatus.Connecting:
        this.statusBarItem.text = `$(sync~spin) LLM: Connecting`;
        this.statusBarItem.tooltip = message || 'Connecting to LLM service...';
        this.statusBarItem.backgroundColor = undefined;
        break;
      case ConnectionStatus.Error:
        this.statusBarItem.text = `$(error) LLM: Error`;
        this.statusBarItem.tooltip = message || 'Error connecting to LLM service';
        this.statusBarItem.backgroundColor = new vscode.ThemeColor('statusBarItem.errorBackground');
        break;
      case ConnectionStatus.Disconnected:
      default:
        this.statusBarItem.text = `$(plug) LLM: Disconnected`;
        this.statusBarItem.tooltip = message || 'Not connected to any LLM service';
        this.statusBarItem.backgroundColor = undefined;
        break;
    }

    // Add command to click the status bar for connection settings
    this.statusBarItem.command = 'vscode-local-llm-agent.openConnectionSettings';
  }

  /**
   * Get the current connection status
   */
  public getStatus(): ConnectionStatus {
    return this.status;
  }

  /**
   * Dispose of the status bar item when extension is deactivated
   */
  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
