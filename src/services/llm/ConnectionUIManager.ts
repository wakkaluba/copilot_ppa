import * as vscode from 'vscode';
import { ILLMProviderStatus } from '../../llm/llm-provider';
import { ConnectionDetailsService } from '../ui/ConnectionDetailsService';
import { ConnectionStatusService } from '../ui/ConnectionStatusService';
import { ModelInfoService } from '../ui/ModelInfoService';
import { BaseConnectionManager } from './BaseConnectionManager';

export class ConnectionUIManager implements vscode.Disposable {
  private readonly statusService: ConnectionStatusService;
  private readonly modelInfoService: ModelInfoService;
  private readonly detailsService: ConnectionDetailsService;
  private readonly disposables: vscode.Disposable[] = [];
  private connectionManager?: BaseConnectionManager;

  constructor() {
    this.statusService = new ConnectionStatusService();
    this.modelInfoService = new ModelInfoService();
    this.detailsService = new ConnectionDetailsService();
    this.disposables.push(this.statusService, this.modelInfoService, this.detailsService);
    this.registerCommands();
  }

  public setConnectionManager(manager: BaseConnectionManager): void {
    this.connectionManager = manager;
    this.subscribeToEvents();
    this.updateUI(this.connectionManager.getStatus());
  }

  private subscribeToEvents(): void {
    if (!this.connectionManager) {
      return;
    }

    this.connectionManager.on('stateChanged', (status) => {
      this.updateUI(status);
    });

    this.connectionManager.on('modelChanged', (status) => {
      this.modelInfoService.updateModelInfo(status.modelInfo);
    });

    this.connectionManager.on('error', (status) => {
      this.statusService.showError(status.error);
    });
  }

  private updateUI(status: ILLMProviderStatus): void {
    this.statusService.updateStatus(status);
    vscode.commands.executeCommand('setContext', 'copilot-ppa.isConnected', status.isConnected);
    vscode.commands.executeCommand('setContext', 'copilot-ppa.isAvailable', status.isAvailable);
  }

  private registerCommands(): void {
    this.disposables.push(
      vscode.commands.registerCommand('copilot-ppa.toggleConnection', () => {
        this.handleToggleConnection();
      }),
      vscode.commands.registerCommand('copilot-ppa.showConnectionDetails', () => {
        this.showConnectionDetails();
      }),
      vscode.commands.registerCommand('copilot-ppa.configureModel', () => {
        this.handleConfigure();
      }),
    );
  }

  private async handleToggleConnection(): Promise<void> {
    if (!this.connectionManager) {
      return;
    }

    try {
      const status = this.connectionManager.getStatus();
      if (status.isConnected) {
        await this.connectionManager.disconnect();
      } else {
        await this.connectionManager.connect();
      }
    } catch (error) {
      this.statusService.showError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async handleConfigure(): Promise<void> {
    if (!this.connectionManager) {
      return;
    }

    try {
      const providers = await this.connectionManager.getAvailableProviders();
      const selected = await this.modelInfoService.selectProvider(providers);
      if (selected) {
        await this.connectionManager.configureProvider(selected);
      }
    } catch (error) {
      this.statusService.showError(error instanceof Error ? error : new Error(String(error)));
    }
  }

  private async showConnectionDetails(): Promise<void> {
    if (!this.connectionManager) {
      return;
    }
    const status = this.connectionManager.getStatus();
    this.detailsService.showConnectionDetails(status);
  }

  public dispose(): void {
    this.disposables.forEach((d) => d.dispose());
  }
}
