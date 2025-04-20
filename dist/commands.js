"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommandManager = void 0;
const vscode = __importStar(require("vscode"));
const modelService_1 = require("./llm/modelService");
/**
 * Command manager for the extension
 * Handles registration and implementation of all commands
 */
class CommandManager {
    modelService;
    context;
    configManager;
    /**
     * Creates a new command manager
     * @param context The extension context
     * @param configManager The configuration manager
     */
    constructor(context, configManager) {
        this.context = context;
        this.configManager = configManager;
        // Create the model service instance
        this.modelService = new modelService_1.LLMModelService(context);
    }
    /**
     * Register all commands with VS Code
     * @returns This command manager instance (for chaining)
     */
    registerCommands() {
        // Register core commands with proper binding of 'this' context
        this.context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.startAgent', this.startAgent.bind(this)), vscode.commands.registerCommand('copilot-ppa.stopAgent', this.stopAgent.bind(this)), vscode.commands.registerCommand('copilot-ppa.restartAgent', this.restartAgent.bind(this)), vscode.commands.registerCommand('copilot-ppa.configureModel', this.configureModel.bind(this)), vscode.commands.registerCommand('copilot-ppa.clearConversation', this.clearConversation.bind(this)), vscode.commands.registerCommand('copilot-ppa.openMenu', this.openMenu.bind(this)), vscode.commands.registerCommand('copilot-ppa.showMetrics', this.showMetrics.bind(this)));
        // Register visualization commands
        this.registerVisualizationCommands();
        return this;
    }
    /**
     * Register commands related to data visualization
     */
    registerVisualizationCommands() {
        this.context.subscriptions.push(vscode.commands.registerCommand('copilot-ppa.showMemoryVisualization', this.showMemoryVisualization.bind(this)), vscode.commands.registerCommand('copilot-ppa.showPerformanceMetrics', this.showPerformanceMetrics.bind(this)), vscode.commands.registerCommand('copilot-ppa.exportMetrics', this.exportMetrics.bind(this)));
    }
    /**
     * Start the analysis agent
     */
    async startAgent() {
        try {
            const config = this.configManager.getConfig();
            vscode.window.withProgress({
                location: vscode.ProgressLocation.Notification,
                title: 'Starting Copilot PPA agent...',
                cancellable: false
            }, async (progress) => {
                progress.report({ increment: 50 });
                // TODO: Implement agent startup logic
                await new Promise(resolve => setTimeout(resolve, 1000));
                progress.report({ increment: 50 });
                await vscode.window.showInformationMessage('Copilot PPA agent started successfully');
            });
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to start Copilot PPA agent: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Stop the analysis agent
     */
    async stopAgent() {
        try {
            // TODO: Implement agent shutdown logic
            await vscode.window.showInformationMessage('Copilot PPA agent stopped');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to stop Copilot PPA agent: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Restart the analysis agent
     */
    async restartAgent() {
        await this.stopAgent();
        await this.startAgent();
    }
    /**
     * Configure the LLM model settings
     */
    async configureModel() {
        try {
            const config = this.configManager.getConfig();
            const providers = ['ollama', 'lmstudio', 'huggingface', 'custom'];
            const selectedProvider = await vscode.window.showQuickPick(providers, {
                placeHolder: 'Select LLM provider',
                title: 'Configure LLM Model'
            });
            if (selectedProvider) {
                // Update the provider in config
                await this.configManager.updateConfig('llm.provider', selectedProvider);
                // If custom, prompt for endpoint
                if (selectedProvider === 'custom') {
                    const endpoint = await vscode.window.showInputBox({
                        prompt: 'Enter custom LLM endpoint URL',
                        value: config.llm.endpoint
                    });
                    if (endpoint) {
                        await this.configManager.updateConfig('llm.endpoint', endpoint);
                    }
                }
                await vscode.window.showInformationMessage(`Model provider updated to ${selectedProvider}`);
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to configure model: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Clear conversation history
     */
    async clearConversation() {
        try {
            // TODO: Clear conversation history from model service
            await vscode.window.showInformationMessage('Conversation history cleared');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to clear conversation: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Open the main menu for the extension
     */
    async openMenu() {
        const options = [
            'Start Agent',
            'Stop Agent',
            'Configure Model',
            'Show Metrics Dashboard',
            'Clear Conversation History',
            'View Documentation'
        ];
        const result = await vscode.window.showQuickPick(options, {
            placeHolder: 'Select an action'
        });
        if (result) {
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
                    // Open documentation in a new webview panel
                    vscode.env.openExternal(vscode.Uri.parse('https://github.com/your-repo/copilot-ppa/docs'));
                    break;
            }
        }
    }
    /**
     * Show metrics dashboard
     */
    async showMetrics() {
        // TODO: Implement metrics dashboard
        await vscode.window.showInformationMessage('Metrics dashboard coming soon');
    }
    /**
     * Show memory visualization panel
     */
    async showMemoryVisualization() {
        const panel = vscode.window.createWebviewPanel('memoryVisualization', 'Memory Usage Visualization', vscode.ViewColumn.One, { enableScripts: true });
        // TODO: Implement memory visualization functionality
        panel.webview.html = this.getMemoryVisualizationHtml();
    }
    /**
     * Show performance metrics panel
     */
    async showPerformanceMetrics() {
        // TODO: Implement performance metrics visualization
        await vscode.window.showInformationMessage('Performance metrics coming soon');
    }
    /**
     * Export metrics to JSON/CSV
     */
    async exportMetrics() {
        // TODO: Implement metrics export functionality
        await vscode.window.showInformationMessage('Metrics export coming soon');
    }
    /**
     * Get HTML content for memory visualization panel
     */
    getMemoryVisualizationHtml() {
        return `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Memory Visualization</title>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        margin: 0;
                        padding: 15px;
                        background-color: var(--vscode-editor-background);
                        color: var(--vscode-editor-foreground);
                    }
                    .chart-container {
                        width: 100%;
                        height: 300px;
                        margin-bottom: 20px;
                    }
                    .metric-card {
                        background-color: var(--vscode-editor-inactiveSelectionBackground);
                        border-radius: 5px;
                        padding: 15px;
                        margin-bottom: 15px;
                    }
                    h2 {
                        margin-top: 0;
                    }
                </style>
            </head>
            <body>
                <h1>Memory Usage Visualization</h1>
                <div class="metric-card">
                    <h2>Memory Usage Over Time</h2>
                    <div class="chart-container" id="memoryChart">
                        <p>Loading chart data...</p>
                    </div>
                </div>
                <div class="metric-card">
                    <h2>Summary</h2>
                    <div id="summary">
                        <p>Collecting memory usage data...</p>
                    </div>
                </div>
                
                <script>
                    // TODO: Add chart.js or other visualization library
                    // and implement memory visualization
                    document.getElementById('summary').innerHTML = 
                        '<p>Memory visualization implementation in progress</p>';
                </script>
            </body>
            </html>
        `;
    }
}
exports.CommandManager = CommandManager;
//# sourceMappingURL=commands.js.map