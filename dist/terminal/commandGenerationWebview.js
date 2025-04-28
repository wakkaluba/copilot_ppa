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
exports.CommandGenerationWebview = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
/**
 * Webview panel for enhanced terminal command generation
 */
class CommandGenerationWebview {
    constructor(context, aiHelper, interactiveShell) {
        this.shellType = types_1.TerminalShellType.VSCodeDefault;
        this.currentCommand = '';
        this.lastAnalysis = null;
        this.context = context;
        this.aiHelper = aiHelper;
        this.interactiveShell = interactiveShell;
    }
    /**
     * Shows the command generation panel
     * @param initialPrompt Initial natural language prompt
     * @param shellType Shell type to use
     */
    async show(initialPrompt = '', shellType = types_1.TerminalShellType.VSCodeDefault) {
        this.shellType = shellType;
        // Create and show panel
        if (!this.panel) {
            this.panel = vscode.window.createWebviewPanel('commandGenerationWebview', 'Terminal Command Generator', vscode.ViewColumn.Two, {
                enableScripts: true,
                retainContextWhenHidden: true,
                localResourceRoots: [
                    vscode.Uri.joinPath(this.context.extensionUri, 'media')
                ]
            });
            // Set up message handling
            this.panel.webview.onDidReceiveMessage(this.handleMessage.bind(this));
            // Clean up when panel is closed
            this.panel.onDidDispose(() => {
                this.panel = undefined;
            });
        }
        else {
            // If panel exists, bring it to front
            this.panel.reveal();
        }
        // Update the HTML content
        this.panel.webview.html = this.getWebviewContent(shellType, initialPrompt);
        // If there's an initial prompt, generate a command
        if (initialPrompt) {
            this.generateCommand(initialPrompt);
        }
    }
    /**
     * Generates HTML content for the webview
     * @param shellType Current shell type
     * @param initialPrompt Initial prompt if any
     * @returns HTML content for the webview
     */
    getWebviewContent(shellType, initialPrompt = '') {
        return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Terminal Command Generator</title>
    <style>
        body {
            font-family: var(--vscode-font-family);
            padding: 20px;
            color: var(--vscode-foreground);
            background-color: var(--vscode-editor-background);
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        .input-section {
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .shell-selector {
            display: flex;
            gap: 10px;
            margin-bottom: 10px;
        }
        textarea, input {
            background-color: var(--vscode-input-background);
            color: var(--vscode-input-foreground);
            border: 1px solid var(--vscode-input-border);
            padding: 8px;
            font-family: var(--vscode-editor-font-family);
            font-size: var(--vscode-editor-font-size);
        }
        textarea {
            min-height: 100px;
            resize: vertical;
        }
        button {
            background-color: var(--vscode-button-background);
            color: var(--vscode-button-foreground);
            border: none;
            padding: 8px 16px;
            cursor: pointer;
            font-weight: bold;
        }
        button:hover {
            background-color: var(--vscode-button-hoverBackground);
        }
        .command-section {
            border: 1px solid var(--vscode-panel-border);
            border-radius: 4px;
            padding: 15px;
            background-color: var(--vscode-editor-inactiveSelectionBackground);
            overflow: auto;
        }
        .command-box {
            font-family: monospace;
            background-color: var(--vscode-terminal-background);
            color: var(--vscode-terminal-foreground);
            padding: 10px;
            border-radius: 4px;
            margin-bottom: 10px;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .actions {
            display: flex;
            gap: 10px;
            margin-top: 10px;
        }
        .details-section {
            margin-top: 15px;
        }
        .details-header {
            font-weight: bold;
            margin-bottom: 5px;
        }
        .details-content {
            margin-bottom: 15px;
            padding-left: 10px;
        }
        .hidden {
            display: none;
        }
        .history-item {
            padding: 5px;
            cursor: pointer;
            border-bottom: 1px solid var(--vscode-panel-border);
        }
        .history-item:hover {
            background-color: var(--vscode-list-hoverBackground);
        }
        .tab-container {
            display: flex;
            border-bottom: 1px solid var(--vscode-panel-border);
            margin-bottom: 10px;
        }
        .tab {
            padding: 8px 16px;
            cursor: pointer;
            border: 1px solid transparent;
            border-bottom: none;
            margin-bottom: -1px;
        }
        .tab.active {
            background-color: var(--vscode-editor-background);
            border-color: var(--vscode-panel-border);
            border-bottom-color: var(--vscode-editor-background);
        }
        .tab-content {
            display: none;
        }
        .tab-content.active {
            display: block;
        }
        .risk {
            color: var(--vscode-errorForeground);
        }
        .alternatives {
            margin-top: 15px;
        }
        .loading {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .spinner {
            border: 4px solid rgba(0, 0, 0, 0.1);
            border-left-color: var(--vscode-progressBar-background);
            border-radius: 50%;
            width: 20px;
            height: 20px;
            animation: spin 1s linear infinite;
            margin-right: 10px;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
    </style>
</head>
<body>
    <div class="container">
        <h2>Terminal Command Generator</h2>
        
        <div class="input-section">
            <div class="shell-selector">
                <label>Shell: </label>
                <select id="shellType">
                    <option value="vscode-default" ${shellType === 'vscode-default' ? 'selected' : ''}>VS Code Default</option>
                    <option value="powershell" ${shellType === 'powershell' ? 'selected' : ''}>PowerShell</option>
                    <option value="git-bash" ${shellType === 'git-bash' ? 'selected' : ''}>Git Bash</option>
                    <option value="wsl-bash" ${shellType === 'wsl-bash' ? 'selected' : ''}>WSL Bash</option>
                </select>
            </div>
            
            <label for="description">Describe what you want to do:</label>
            <textarea id="description" placeholder="Enter a description of the command you need...">${initialPrompt}</textarea>
            
            <div class="actions">
                <button id="generateBtn">Generate Command</button>
                <button id="clearBtn">Clear</button>
                <button id="historyBtn">Show History</button>
            </div>
        </div>
        
        <div id="loadingIndicator" class="loading hidden">
            <div class="spinner"></div>
            <span>Generating command...</span>
        </div>
        
        <div id="resultSection" class="command-section hidden">
            <div class="tab-container">
                <div class="tab active" data-tab="command">Command</div>
                <div class="tab" data-tab="explanation">Explanation</div>
                <div class="tab" data-tab="analysis">Analysis</div>
                <div class="tab" data-tab="variations">Variations</div>
            </div>
            
            <div id="commandTab" class="tab-content active">
                <div class="command-box" id="commandOutput"></div>
                
                <div class="actions">
                    <button id="runBtn">Run Command</button>
                    <button id="copyBtn">Copy to Clipboard</button>
                    <button id="analyzeBtn">Analyze</button>
                    <button id="variationsBtn">Generate Variations</button>
                </div>
                
                <div class="details-section">
                    <div class="details-header">Warnings:</div>
                    <div class="details-content" id="warningsOutput"></div>
                </div>
            </div>
            
            <div id="explanationTab" class="tab-content">
                <div class="details-content" id="explanationOutput"></div>
            </div>
            
            <div id="analysisTab" class="tab-content">
                <div id="analysisOutput">
                    <p>Click "Analyze" on the Command tab to see detailed analysis.</p>
                </div>
            </div>
            
            <div id="variationsTab" class="tab-content">
                <div id="variationsOutput">
                    <p>Click "Generate Variations" on the Command tab to see different ways to accomplish the same task.</p>
                </div>
                <div class="hidden" id="variationsPromptSection">
                    <input type="text" id="variationsPrompt" placeholder="Describe how you want to vary the command...">
                    <button id="getVariationsBtn">Get Variations</button>
                </div>
            </div>
        </div>
        
        <div id="historySection" class="command-section hidden">
            <h3>Command History</h3>
            <div id="historyList"></div>
            <button id="closeHistoryBtn">Close History</button>
        </div>
    </div>
    
    <script>
        (function() {
            const vscode = acquireVsCodeApi();
            const description = document.getElementById('description');
            const shellType = document.getElementById('shellType');
            const generateBtn = document.getElementById('generateBtn');
            const clearBtn = document.getElementById('clearBtn');
            const historyBtn = document.getElementById('historyBtn');
            const runBtn = document.getElementById('runBtn');
            const copyBtn = document.getElementById('copyBtn');
            const analyzeBtn = document.getElementById('analyzeBtn');
            const variationsBtn = document.getElementById('variationsBtn');
            const commandOutput = document.getElementById('commandOutput');
            const warningsOutput = document.getElementById('warningsOutput');
            const explanationOutput = document.getElementById('explanationOutput');
            const analysisOutput = document.getElementById('analysisOutput');
            const variationsOutput = document.getElementById('variationsOutput');
            const resultSection = document.getElementById('resultSection');
            const loadingIndicator = document.getElementById('loadingIndicator');
            const historySection = document.getElementById('historySection');
            const historyList = document.getElementById('historyList');
            const closeHistoryBtn = document.getElementById('closeHistoryBtn');
            const variationsPromptSection = document.getElementById('variationsPromptSection');
            const variationsPrompt = document.getElementById('variationsPrompt');
            const getVariationsBtn = document.getElementById('getVariationsBtn');
            
            // Tab switching
            document.querySelectorAll('.tab').forEach(tab => {
                tab.addEventListener('click', () => {
                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                    
                    tab.classList.add('active');
                    document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');
                });
            });
            
            // Generate command
            generateBtn.addEventListener('click', () => {
                const descText = description.value.trim();
                if (!descText) return;
                
                loadingIndicator.classList.remove('hidden');
                resultSection.classList.add('hidden');
                
                vscode.postMessage({
                    command: 'generate',
                    description: descText,
                    shellType: shellType.value
                });
            });
            
            // Run command
            runBtn.addEventListener('click', () => {
                if (!commandOutput.textContent) return;
                
                vscode.postMessage({
                    command: 'run',
                    terminalCommand: commandOutput.textContent,
                    shellType: shellType.value
                });
            });
            
            // Copy command to clipboard
            copyBtn.addEventListener('click', () => {
                if (!commandOutput.textContent) return;
                
                vscode.postMessage({
                    command: 'copy',
                    terminalCommand: commandOutput.textContent
                });
            });
            
            // Analyze command
            analyzeBtn.addEventListener('click', () => {
                if (!commandOutput.textContent) return;
                
                analysisOutput.innerHTML = '<div class="loading"><div class="spinner"></div><span>Analyzing command...</span></div>';
                
                // Switch to analysis tab
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.querySelector('.tab[data-tab="analysis"]').classList.add('active');
                document.getElementById('analysisTab').classList.add('active');
                
                vscode.postMessage({
                    command: 'analyze',
                    terminalCommand: commandOutput.textContent,
                    shellType: shellType.value
                });
            });
            
            // Generate variations
            variationsBtn.addEventListener('click', () => {
                if (!commandOutput.textContent) return;
                
                // Switch to variations tab
                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                document.querySelector('.tab[data-tab="variations"]').classList.add('active');
                document.getElementById('variationsTab').classList.add('active');
                
                variationsPromptSection.classList.remove('hidden');
            });
            
            // Get variations with prompt
            getVariationsBtn.addEventListener('click', () => {
                if (!commandOutput.textContent || !variationsPrompt.value) return;
                
                variationsOutput.innerHTML = '<div class="loading"><div class="spinner"></div><span>Generating variations...</span></div>';
                
                vscode.postMessage({
                    command: 'variations',
                    terminalCommand: commandOutput.textContent,
                    description: variationsPrompt.value,
                    shellType: shellType.value
                });
            });
            
            // Clear inputs
            clearBtn.addEventListener('click', () => {
                description.value = '';
                commandOutput.textContent = '';
                warningsOutput.textContent = '';
                explanationOutput.textContent = '';
                analysisOutput.innerHTML = '<p>Click "Analyze" on the Command tab to see detailed analysis.</p>';
                variationsOutput.innerHTML = '<p>Click "Generate Variations" on the Command tab to see different ways to accomplish the same task.</p>';
                resultSection.classList.add('hidden');
            });
            
            // Show command history
            historyBtn.addEventListener('click', () => {
                vscode.postMessage({
                    command: 'getHistory',
                    shellType: shellType.value
                });
            });
            
            // Close history
            closeHistoryBtn.addEventListener('click', () => {
                historySection.classList.add('hidden');
                if (commandOutput.textContent) {
                    resultSection.classList.remove('hidden');
                }
            });
            
            // Handle messages from extension
            window.addEventListener('message', event => {
                const message = event.data;
                
                switch (message.command) {
                    case 'generationResult':
                        loadingIndicator.classList.add('hidden');
                        resultSection.classList.remove('hidden');
                        
                        commandOutput.textContent = message.result.command || '';
                        warningsOutput.innerHTML = message.result.warnings || 'No warnings.';
                        explanationOutput.innerHTML = message.result.explanation || '';
                        
                        // Switch to command tab
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
                        document.querySelector('.tab[data-tab="command"]').classList.add('active');
                        document.getElementById('commandTab').classList.add('active');
                        
                        // Show alternatives if available
                        if (message.result.alternatives && message.result.alternatives.length > 0) {
                            let alternativesHtml = '<div class="details-header">Alternatives:</div><ul>';
                            message.result.alternatives.forEach(alt => {
                                alternativesHtml += \`<li>\${alt}</li>\`;
                            });
                            alternativesHtml += '</ul>';
                            explanationOutput.innerHTML += alternativesHtml;
                        }
                        break;
                        
                    case 'analysisResult':
                        let analysisHtml = \`
                            <div class="details-header">Purpose:</div>
                            <div class="details-content">\${message.analysis.purpose}</div>
                            
                            <div class="details-header">Components:</div>
                            <ul>
                        \`;
                        
                        message.analysis.components.forEach(component => {
                            analysisHtml += \`<li>\${component}</li>\`;
                        });
                        
                        analysisHtml += '</ul><div class="details-header">Risks:</div><ul class="risk">';
                        
                        message.analysis.risks.forEach(risk => {
                            analysisHtml += \`<li>\${risk}</li>\`;
                        });
                        
                        analysisHtml += \`
                            </ul>
                            
                            <div class="details-header">Performance Considerations:</div>
                            <div class="details-content">\${message.analysis.performance}</div>
                            
                            <div class="details-header">Alternatives:</div>
                            <ul class="alternatives">
                        \`;
                        
                        message.analysis.alternatives.forEach(alternative => {
                            analysisHtml += \`<li>\${alternative}</li>\`;
                        });
                        
                        analysisHtml += '</ul>';
                        analysisOutput.innerHTML = analysisHtml;
                        break;
                        
                    case 'variationsResult':
                        let variationsHtml = '<div class="details-header">Command Variations:</div><ul>';
                        
                        message.variations.forEach(variation => {
                            variationsHtml += \`
                                <li>
                                    <div class="command-box">\${variation}</div>
                                    <button class="run-variation" data-command="\${variation}">Run</button>
                                    <button class="copy-variation" data-command="\${variation}">Copy</button>
                                </li>
                            \`;
                        });
                        
                        variationsHtml += '</ul>';
                        variationsOutput.innerHTML = variationsHtml;
                        
                        // Add event listeners to variation buttons
                        document.querySelectorAll('.run-variation').forEach(btn => {
                            btn.addEventListener('click', () => {
                                vscode.postMessage({
                                    command: 'run',
                                    terminalCommand: btn.dataset.command,
                                    shellType: shellType.value
                                });
                            });
                        });
                        
                        document.querySelectorAll('.copy-variation').forEach(btn => {
                            btn.addEventListener('click', () => {
                                vscode.postMessage({
                                    command: 'copy',
                                    terminalCommand: btn.dataset.command
                                });
                            });
                        });
                        break;
                        
                    case 'historyResult':
                        historySection.classList.remove('hidden');
                        resultSection.classList.add('hidden');
                        
                        if (message.history.length === 0) {
                            historyList.innerHTML = '<p>No command history available.</p>';
                        } else {
                            let historyHtml = '';
                            message.history.forEach(entry => {
                                const status = entry.result?.success ? '✓' : '✗';
                                historyHtml += \`
                                    <div class="history-item" data-command="\${entry.command}">
                                        <span>\${status}</span> <strong>\${entry.command}</strong>
                                        <div>\${new Date(entry.timestamp).toLocaleString()}</div>
                                    </div>
                                \`;
                            });
                            historyList.innerHTML = historyHtml;
                            
                            // Add event listeners to history items
                            document.querySelectorAll('.history-item').forEach(item => {
                                item.addEventListener('click', () => {
                                    commandOutput.textContent = item.dataset.command;
                                    historySection.classList.add('hidden');
                                    resultSection.classList.remove('hidden');
                                });
                            });
                        }
                        break;
                        
                    case 'notification':
                        // You could implement a notification system here
                        break;
                }
            });
            
            // Initial setup if there's a description
            if (description.value.trim()) {
                generateBtn.click();
            }
        })();
    </script>
</body>
</html>`;
    }
    /**
     * Handles messages from the webview
     * @param message Message from the webview
     */
    async handleMessage(message) {
        switch (message.command) {
            case 'generate':
                await this.generateCommand(message.description);
                break;
            case 'run':
                await this.runCommand(message.terminalCommand);
                break;
            case 'copy':
                await vscode.env.clipboard.writeText(message.terminalCommand);
                vscode.window.showInformationMessage('Command copied to clipboard');
                break;
            case 'analyze':
                await this.analyzeCommand(message.terminalCommand);
                break;
            case 'variations':
                await this.generateVariations(message.terminalCommand, message.description);
                break;
            case 'getHistory':
                await this.getCommandHistory(message.shellType);
                break;
        }
    }
    /**
     * Generates a command from natural language
     * @param description Natural language description
     */
    async generateCommand(description) {
        try {
            const result = await this.aiHelper.generateCommandFromDescription(description, this.shellType, true);
            this.currentCommand = result.command;
            // Send result to webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'generationResult',
                    result
                });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate command: ${error instanceof Error ? error.message : String(error)}`);
            // Send error to webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'generationResult',
                    result: {
                        command: '',
                        explanation: '',
                        warnings: `Error: ${error instanceof Error ? error.message : String(error)}`,
                        alternatives: [],
                        isValid: false
                    }
                });
            }
        }
    }
    /**
     * Runs a command in a terminal
     * @param terminalCommand Command to run
     */
    async runCommand(terminalCommand) {
        try {
            await this.interactiveShell.executeCommand(terminalCommand, this.shellType);
            vscode.window.showInformationMessage('Command executed successfully');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to execute command: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Analyzes a command
     * @param terminalCommand Command to analyze
     */
    async analyzeCommand(terminalCommand) {
        try {
            const analysis = await this.aiHelper.analyzeCommand(terminalCommand, this.shellType);
            this.lastAnalysis = analysis;
            // Send analysis to webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'analysisResult',
                    analysis
                });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to analyze command: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Generates variations of a command
     * @param terminalCommand Base command
     * @param description Description of variations needed
     */
    async generateVariations(terminalCommand, description) {
        try {
            const variations = await this.aiHelper.generateCommandVariations(terminalCommand, description, this.shellType);
            // Send variations to webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'variationsResult',
                    variations
                });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to generate variations: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Gets command history
     * @param shellType Shell type to filter by
     */
    async getCommandHistory(shellType) {
        try {
            const history = this.interactiveShell.getCommandHistory(shellType);
            // Send history to webview
            if (this.panel) {
                this.panel.webview.postMessage({
                    command: 'historyResult',
                    history
                });
            }
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to get command history: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.CommandGenerationWebview = CommandGenerationWebview;
//# sourceMappingURL=commandGenerationWebview.js.map