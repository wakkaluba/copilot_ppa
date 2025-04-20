import * as vscode from 'vscode';
import { ConnectionState } from '../../status/connectionStatusService';
import { LLMProvider, LLMModelInfo, LLMProviderStatus } from '../../llm/llm-provider';
import { BaseConnectionManager } from './BaseConnectionManager';

interface ConnectionUIComponents {
    statusBarItem: vscode.StatusBarItem;
    modelInfoBar: vscode.StatusBarItem;
    errorBar: vscode.StatusBarItem;
}

/**
 * Manages the UI components for LLM connection status and controls
 */
export class ConnectionUIManager implements vscode.Disposable {
    private readonly components: ConnectionUIComponents;
    private readonly disposables: vscode.Disposable[] = [];
    private connectionManager?: BaseConnectionManager;

    constructor() {
        // Create status bar items with appropriate priorities
        this.components = {
            statusBarItem: vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Right,
                1000
            ),
            modelInfoBar: vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Right,
                999
            ),
            errorBar: vscode.window.createStatusBarItem(
                vscode.StatusBarAlignment.Right,
                1001
            )
        };

        // Initialize status bar items
        this.components.statusBarItem.command = 'copilot-ppa.toggleConnection';
        this.components.modelInfoBar.command = 'copilot-ppa.configureModel';
        this.components.errorBar.command = 'copilot-ppa.showConnectionDetails';

        this.registerCommands();
    }

    /**
     * Set the connection manager and subscribe to its events
     */
    public setConnectionManager(manager: BaseConnectionManager): void {
        this.connectionManager = manager;
        this.subscribeToEvents();
        this.updateUI(this.connectionManager.getStatus());
    }

    /**
     * Subscribe to connection manager events
     */
    private subscribeToEvents(): void {
        if (!this.connectionManager) return;

        this.connectionManager.on('stateChanged', status => {
            this.updateUI(status);
        });

        this.connectionManager.on('modelChanged', status => {
            this.updateModelInfo(status.modelInfo);
        });

        this.connectionManager.on('error', status => {
            this.showError(status.error);
        });
    }

    /**
     * Update all UI components based on connection status
     */
    private updateUI(status: LLMProviderStatus): void {
        // Update main status bar
        const statusIcon = this.getStatusIcon(status);
        const statusText = this.getStatusText(status);
        this.components.statusBarItem.text = `${statusIcon} LLM: ${statusText}`;
        this.components.statusBarItem.tooltip = this.getStatusTooltip(status);
        this.components.statusBarItem.show();

        // Update command visibility
        vscode.commands.executeCommand('setContext', 'copilot-ppa.isConnected', status.isConnected);
        vscode.commands.executeCommand('setContext', 'copilot-ppa.isAvailable', status.isAvailable);

        // Show/hide error bar
        if (status.error) {
            this.showError(new Error(status.error));
        } else {
            this.components.errorBar.hide();
        }
    }

    /**
     * Update model information display
     */
    private updateModelInfo(modelInfo?: LLMModelInfo): void {
        if (!modelInfo) {
            this.components.modelInfoBar.hide();
            return;
        }

        const truncatedName = modelInfo.name.length > 20 
            ? modelInfo.name.substring(0, 17) + '...'
            : modelInfo.name;

        this.components.modelInfoBar.text = `$(symbol-misc) ${truncatedName}`;
        this.components.modelInfoBar.tooltip = this.getModelTooltip(modelInfo);
        this.components.modelInfoBar.show();
    }

    /**
     * Show error status
     */
    private showError(error?: Error): void {
        if (!error) {
            this.components.errorBar.hide();
            return;
        }

        this.components.errorBar.text = '$(error) LLM Error';
        this.components.errorBar.tooltip = error.message;
        this.components.errorBar.show();
    }

    /**
     * Register UI-related commands
     */
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
            })
        );
    }

    /**
     * Handle connection toggle
     */
    private async handleToggleConnection(): Promise<void> {
        if (!this.connectionManager) return;

        try {
            const status = this.connectionManager.getStatus();
            if (status.isConnected) {
                await this.connectionManager.disconnect();
            } else {
                await this.connectionManager.connect();
            }
        } catch (error) {
            this.showError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Handle configuration request
     */
    private async handleConfigure(): Promise<void> {
        if (!this.connectionManager) return;

        try {
            const providers = await this.connectionManager.getAvailableProviders();
            const selected = await vscode.window.showQuickPick(
                providers.map(p => ({
                    label: p.name,
                    description: p.isAvailable ? 'Available' : 'Not available'
                })),
                { placeHolder: 'Select LLM Provider' }
            );

            if (selected) {
                await this.connectionManager.configureProvider(selected.label);
            }
        } catch (error) {
            this.showError(error instanceof Error ? error : new Error(String(error)));
        }
    }

    /**
     * Show detailed connection information
     */
    private async showConnectionDetails(): Promise<void> {
        if (!this.connectionManager) return;

        const status = this.connectionManager.getStatus();
        const modelInfo = status.modelInfo;

        const panel = vscode.window.createWebviewPanel(
            'llmConnection',
            'LLM Connection Details',
            vscode.ViewColumn.One,
            { enableScripts: true }
        );

        panel.webview.html = this.getConnectionDetailsHtml(status, modelInfo);
    }

    /**
     * Get status icon based on connection state
     */
    private getStatusIcon(status: LLMProviderStatus): string {
        if (!status.isAvailable) return '$(circle-slash)';
        if (status.error) return '$(error)';
        if (status.isConnected) return '$(check)';
        return '$(circle-outline)';
    }

    /**
     * Get status text based on connection state
     */
    private getStatusText(status: LLMProviderStatus): string {
        if (!status.isAvailable) return 'Unavailable';
        if (status.error) return 'Error';
        if (status.isConnected) return 'Connected';
        return 'Disconnected';
    }

    /**
     * Get detailed status tooltip
     */
    private getStatusTooltip(status: LLMProviderStatus): string {
        const parts = [
            `Status: ${this.getStatusText(status)}`,
            status.activeModel ? `Model: ${status.activeModel}` : null,
            status.error ? `Error: ${status.error}` : null
        ];
        return parts.filter(Boolean).join('\n');
    }

    /**
     * Get model information tooltip
     */
    private getModelTooltip(modelInfo: LLMModelInfo): string {
        const parts = [
            `Model: ${modelInfo.name}`,
            `Provider: ${modelInfo.provider}`,
            modelInfo.parameters ? `Parameters: ${modelInfo.parameters}B` : null,
            modelInfo.contextLength ? `Context: ${modelInfo.contextLength} tokens` : null,
            modelInfo.capabilities.length ? `Capabilities: ${modelInfo.capabilities.join(', ')}` : null,
            modelInfo.license ? `License: ${modelInfo.license}` : null
        ];
        return parts.filter(Boolean).join('\n');
    }

    /**
     * Generate HTML for connection details panel
     */
    private getConnectionDetailsHtml(
        status: LLMProviderStatus,
        modelInfo?: LLMModelInfo
    ): string {
        return `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        padding: 20px;
                        line-height: 1.5;
                        font-family: var(--vscode-font-family);
                        color: var(--vscode-foreground);
                    }
                    .section {
                        margin-bottom: 20px;
                        padding: 15px;
                        background: var(--vscode-editor-background);
                        border: 1px solid var(--vscode-panel-border);
                        border-radius: 4px;
                    }
                    .status-badge {
                        display: inline-block;
                        padding: 2px 8px;
                        border-radius: 12px;
                        font-size: 12px;
                        margin-left: 8px;
                    }
                    .status-connected { background: var(--vscode-testing-iconPassed); }
                    .status-error { background: var(--vscode-testing-iconFailed); }
                    .status-disconnected { background: var(--vscode-testing-iconSkipped); }
                </style>
            </head>
            <body>
                <div class="section">
                    <h2>Connection Status</h2>
                    <p>
                        Status: ${this.getStatusText(status)}
                        <span class="status-badge status-${status.isConnected ? 'connected' : 'disconnected'}">
                            ${this.getStatusText(status)}
                        </span>
                    </p>
                    ${status.error ? `
                        <p style="color: var(--vscode-errorForeground)">
                            Error: ${status.error}
                        </p>
                    ` : ''}
                </div>

                ${modelInfo ? `
                    <div class="section">
                        <h2>Model Information</h2>
                        <p><strong>Name:</strong> ${modelInfo.name}</p>
                        <p><strong>Provider:</strong> ${modelInfo.provider}</p>
                        ${modelInfo.parameters ? `
                            <p><strong>Parameters:</strong> ${modelInfo.parameters}B</p>
                        ` : ''}
                        ${modelInfo.contextLength ? `
                            <p><strong>Context Length:</strong> ${modelInfo.contextLength} tokens</p>
                        ` : ''}
                        ${modelInfo.capabilities.length ? `
                            <p><strong>Capabilities:</strong> ${modelInfo.capabilities.join(', ')}</p>
                        ` : ''}
                        ${modelInfo.license ? `
                            <p><strong>License:</strong> ${modelInfo.license}</p>
                        ` : ''}
                    </div>
                ` : ''}
            </body>
            </html>
        `;
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.components.statusBarItem.dispose();
        this.components.modelInfoBar.dispose();
        this.components.errorBar.dispose();
        this.disposables.forEach(d => d.dispose());
    }
}