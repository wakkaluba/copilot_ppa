import * as vscode from 'vscode';
import * as path from 'path';
import { ModelService } from './llm/modelService';
import { ConfigManager } from './config';
import { ICommandService } from './services/interfaces';

interface CommandHandler {
    execute: (...args: any[]) => Promise<void>;
}

export class CommandManager implements ICommandService {
    private readonly _modelService: ModelService;
    private readonly _context: vscode.ExtensionContext;
    private readonly _config: ConfigManager;
    private readonly _registeredCommands: Map<string, CommandHandler>;

    constructor(context: vscode.ExtensionContext, configManager: ConfigManager) {
        this._context = context;
        this._config = configManager;
        this._modelService = new ModelService(context);
        this._registeredCommands = new Map();
    }

    async initialize(): Promise<void> {
        await this.initializeCommandHandlers();
        await this.registerCommands();
    }

    private initializeCommandHandlers(): Promise<void> {
        // Agent commands
        this.registerCommand('copilot-ppa.startAgent', { execute: this.startAgent.bind(this) });
        this.registerCommand('copilot-ppa.stopAgent', { execute: this.stopAgent.bind(this) });
        this.registerCommand('copilot-ppa.restartAgent', { execute: this.restartAgent.bind(this) });
        
        // Configuration commands
        this.registerCommand('copilot-ppa.configureModel', { execute: this.configureModel.bind(this) });
        this.registerCommand('copilot-ppa.clearConversation', { execute: this.clearConversation.bind(this) });
        
        // Menu commands
        this.registerCommand('copilot-ppa.openMenu', { execute: this.openMenu.bind(this) });
        this.registerCommand('copilot-ppa.showMetrics', { execute: this.showMetrics.bind(this) });
        
        // Visualization commands
        this.registerCommand('copilot-ppa.showMemoryVisualization', { execute: this.showMemoryVisualization.bind(this) });
        this.registerCommand('copilot-ppa.showPerformanceMetrics', { execute: this.showPerformanceMetrics.bind(this) });
        this.registerCommand('copilot-ppa.exportMetrics', { execute: this.exportMetrics.bind(this) });

        return Promise.resolve();
    }

    registerCommand(command: string, handler: CommandHandler): void {
        this._registeredCommands.set(command, handler);
        const disposable = vscode.commands.registerCommand(command, handler.execute);
        this._context.subscriptions.push(disposable);
    }

    async registerCommands(): Promise<void> {
        // All commands are already registered in constructor
        return Promise.resolve();
    }

    async startAgent(): Promise<void> {
        try {
            await vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Starting Copilot PPA agent...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 50 });
                const recommendations = await this._modelService.getModelRecommendations();
                if (recommendations.length > 0) {
                    const defaultModel = recommendations[0];
                    if (defaultModel) {
                        await this._modelService.checkModelCompatibility(defaultModel);
                    }
                }
                progress.report({ increment: 50 });
                await vscode.window.showInformationMessage('Copilot PPA agent started successfully');
            });
        } catch (error) {
            this.handleError('Failed to start Copilot PPA agent', error);
        }
    }

    async stopAgent(): Promise<void> {
        try {
            await this._modelService.dispose();
            await vscode.window.showInformationMessage('Copilot PPA agent stopped');
        } catch (error) {
            this.handleError('Failed to stop Copilot PPA agent', error);
        }
    }

    async restartAgent(): Promise<void> {
        try {
            await this.stopAgent();
            await this.startAgent();
        } catch (error) {
            this.handleError('Failed to restart Copilot PPA agent', error);
        }
    }

    async configureModel(): Promise<void> {
        try {
            const config = this._config.getConfig();
            
            const providers = ['ollama', 'lmstudio', 'huggingface', 'custom'];
            const selectedProvider = await vscode.window.showQuickPick(providers, {
                placeHolder: 'Select LLM provider',
                title: 'Configure LLM Model'
            });
            
            if (selectedProvider) {
                await this._config.updateConfig('llm.provider', selectedProvider);
                
                if (selectedProvider === 'custom') {
                    const endpoint = await vscode.window.showInputBox({
                        prompt: 'Enter custom LLM endpoint URL',
                        value: config.llm.endpoint,
                        validateInput: this.validateEndpointUrl
                    });
                    
                    if (endpoint) {
                        await this._config.updateConfig('llm.endpoint', endpoint);
                    }
                }
                
                await vscode.window.showInformationMessage(`Model provider updated to ${selectedProvider}`);
            }
        } catch (error) {
            this.handleError('Failed to configure model', error);
        }
    }

    private validateEndpointUrl(url: string): string | undefined {
        try {
            new URL(url);
            return undefined;
        } catch {
            return 'Please enter a valid URL';
        }
    }

    async clearConversation(): Promise<void> {
        try {
            // Dispose the model service which will clear its state
            await this._modelService.dispose();
            // The service will be reinitialized on next use
            await vscode.window.showInformationMessage('Conversation history cleared');
        } catch (error) {
            this.handleError('Failed to clear conversation', error);
        }
    }

    async openMenu(): Promise<void> {
        const options = [
            'Start Agent',
            'Stop Agent',
            'Configure Model',
            'Show Metrics Dashboard',
            'Clear Conversation History',
            'View Documentation'
        ] as const;
        
        const result = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select an action'
        });
        
        if (result) {
            try {
                switch (result) {
                    case 'Start Agent':
                        await this.startAgent();
                        break;
                    case 'Stop Agent':
                        await this.stopAgent();
                        break;
                    case 'Configure Model':
                        await this.configureModel();
                        break;
                    case 'Show Metrics Dashboard':
                        await this.showMetrics();
                        break;
                    case 'Clear Conversation History':
                        await this.clearConversation();
                        break;
                    case 'View Documentation':
                        await vscode.env.openExternal(vscode.Uri.parse('https://github.com/your-repo/copilot-ppa/docs'));
                        break;
                }
            } catch (error) {
                this.handleError('Failed to execute menu action', error);
            }
        }
    }

    async showMetrics(): Promise<void> {
        try {
            const panel = await this.createWebviewPanel('metrics', 'PPA Metrics Dashboard');
            panel.webview.html = '<h1>Metrics Dashboard Coming Soon</h1>';
            await vscode.window.showInformationMessage('Metrics dashboard coming soon');
        } catch (error) {
            this.handleError('Failed to show metrics', error);
        }
    }

    async showMemoryVisualization(): Promise<void> {
        try {
            const panel = await this.createWebviewPanel('memoryVisualization', 'Memory Usage Visualization');
            const templatePath = path.join(this._context.extensionPath, 'src', 'webview', 'templates', 'memoryVisualization.html');
            const template = await vscode.workspace.fs.readFile(vscode.Uri.file(templatePath));
            panel.webview.html = template.toString();
        } catch (error) {
            this.handleError('Failed to show memory visualization', error);
        }
    }

    async showPerformanceMetrics(): Promise<void> {
        try {
            const panel = await this.createWebviewPanel('performanceMetrics', 'Performance Metrics');
            panel.webview.html = '<h1>Performance Metrics Coming Soon</h1>';
            await vscode.window.showInformationMessage('Performance metrics coming soon');
        } catch (error) {
            this.handleError('Failed to show performance metrics', error);
        }
    }

    async exportMetrics(): Promise<void> {
        try {
            // TODO: Implement metrics export functionality
            await vscode.window.showInformationMessage('Metrics export coming soon');
        } catch (error) {
            this.handleError('Failed to export metrics', error);
        }
    }

    private async createWebviewPanel(viewType: string, title: string): Promise<vscode.WebviewPanel> {
        return vscode.window.createWebviewPanel(
            viewType,
            title,
            vscode.ViewColumn.One,
            {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.file(path.join(this._context.extensionPath, 'media')),
                    vscode.Uri.file(path.join(this._context.extensionPath, 'src', 'webview', 'templates'))
                ]
            }
        );
    }

    private handleError(message: string, error: unknown): void {
        const errorMessage = error instanceof Error ? error.message : String(error);
        vscode.window.showErrorMessage(`${message}: ${errorMessage}`);
    }

    dispose(): void {
        this._modelService.dispose();
        this._registeredCommands.clear();
    }
}
