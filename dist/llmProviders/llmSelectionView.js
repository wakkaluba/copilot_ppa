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
exports.LLMSelectionView = void 0;
const vscode = __importStar(require("vscode"));
class LLMSelectionView {
    constructor(context, modelsManager) {
        this.context = context;
        this.modelsManager = modelsManager;
        // Listen for model changes
        this.modelsManager.onModelsChanged(() => {
            if (this.panel) {
                this.updateView();
            }
        });
    }
    /**
     * Show the LLM selection view
     */
    show() {
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        this.panel = vscode.window.createWebviewPanel('llmSelection', 'LLM Model Selection', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'media')
            ]
        });
        // Set up message handling
        this.panel.webview.onDidReceiveMessage(async (message) => {
            await this.handleWebviewMessage(message);
        }, null, this.context.subscriptions);
        // Update the view content
        this.updateView();
        // Clean up when the panel is closed
        this.panel.onDidDispose(() => {
            this.panel = undefined;
        }, null, this.context.subscriptions);
    }
    /**
     * Update the webview content
     */
    updateView() {
        if (!this.panel) {
            return;
        }
        this.panel.webview.html = this.getWebviewContent();
    }
    /**
     * Generate the HTML content for the webview
     */
    getWebviewContent() {
        const localModels = this.modelsManager.getLocalModels();
        const huggingfaceModels = this.modelsManager.getHuggingFaceModels();
        const nonce = this.getNonce();
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>LLM Model Selection</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-foreground);
                    background-color: var(--vscode-editor-background);
                }
                .container {
                    max-width: 100%;
                }
                h1 {
                    font-size: 24px;
                    margin-bottom: 20px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 10px;
                }
                h2 {
                    font-size: 18px;
                    margin-top: 30px;
                    margin-bottom: 15px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    padding-bottom: 8px;
                }
                .status-bar {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    padding: 10px;
                    margin-bottom: 20px;
                    border-radius: 4px;
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                }
                .status-indicator {
                    display: flex;
                    align-items: center;
                }
                .status-dot {
                    width: 12px;
                    height: 12px;
                    border-radius: 50%;
                    margin-right: 8px;
                }
                .status-dot.running {
                    background-color: #4CAF50;
                }
                .status-dot.stopped {
                    background-color: #F44336;
                }
                .status-dot.not-installed {
                    background-color: #9E9E9E;
                }
                .action-button {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    padding: 6px 12px;
                    border-radius: 2px;
                    cursor: pointer;
                    margin-left: 10px;
                }
                .action-button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                .action-button:disabled {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .model-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 16px;
                    margin-top: 20px;
                }
                .model-card {
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                    padding: 15px;
                    position: relative;
                }
                .model-card.installed {
                    border-color: #4CAF50;
                    border-width: 2px;
                }
                .installed-tag {
                    position: absolute;
                    top: 10px;
                    right: 10px;
                    background-color: #4CAF50;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 10px;
                    font-size: 12px;
                }
                .model-name {
                    font-weight: bold;
                    font-size: 16px;
                    margin-bottom: 5px;
                }
                .model-provider {
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 10px;
                }
                .model-description {
                    margin-bottom: 10px;
                    font-size: 14px;
                }
                .model-meta {
                    display: flex;
                    justify-content: space-between;
                    font-size: 12px;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 15px;
                }
                .model-tags {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 5px;
                    margin-bottom: 15px;
                }
                .model-tag {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-radius: 10px;
                    padding: 2px 8px;
                    font-size: 12px;
                }
                .model-actions {
                    display: flex;
                    justify-content: flex-end;
                }
                .tabs {
                    display: flex;
                    border-bottom: 1px solid var(--vscode-panel-border);
                    margin-bottom: 20px;
                }
                .tab {
                    padding: 10px 20px;
                    cursor: pointer;
                    border-bottom: 2px solid transparent;
                }
                .tab.active {
                    border-bottom-color: var(--vscode-focusBorder);
                    font-weight: bold;
                }
                .tab-content {
                    display: none;
                }
                .tab-content.active {
                    display: block;
                }
                .search-bar {
                    margin-bottom: 20px;
                    width: 100%;
                }
                .search-input {
                    width: 100%;
                    padding: 8px;
                    border: 1px solid var(--vscode-input-border);
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border-radius: 4px;
                }
                .filter-bar {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-bottom: 15px;
                }
                .filter-chip {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    border-radius: 15px;
                    padding: 5px 12px;
                    cursor: pointer;
                    font-size: 13px;
                }
                .filter-chip.active {
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                }
                .install-instructions {
                    background-color: var(--vscode-editor-lineHighlightBackground);
                    padding: 15px;
                    border-radius: 4px;
                    margin-top: 15px;
                    font-size: 14px;
                }
                .install-instructions pre {
                    background-color: var(--vscode-editor-background);
                    padding: 10px;
                    border-radius: 4px;
                    overflow-x: auto;
                    margin-top: 10px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <h1>LLM Model Selection</h1>
                
                <div class="status-bar">
                    <div class="status-indicator" id="ollama-status">
                        <div class="status-dot" id="ollama-status-dot"></div>
                        <span>Ollama: Checking...</span>
                    </div>
                    <div>
                        <button class="action-button" id="refresh-status">Refresh Status</button>
                        <button class="action-button" id="install-ollama">Install Ollama</button>
                        <button class="action-button" id="start-ollama" disabled>Start Ollama</button>
                    </div>
                </div>
                
                <div class="status-bar">
                    <div class="status-indicator" id="lmstudio-status">
                        <div class="status-dot" id="lmstudio-status-dot"></div>
                        <span>LM Studio: Checking...</span>
                    </div>
                    <div>
                        <button class="action-button" id="install-lmstudio">Install LM Studio</button>
                    </div>
                </div>
                
                <div class="tabs">
                    <div class="tab active" data-tab="local">Local Models</div>
                    <div class="tab" data-tab="huggingface">Hugging Face Models</div>
                </div>
                
                <div class="tab-content active" id="local-tab">
                    <div class="search-bar">
                        <input type="text" class="search-input" id="local-search" placeholder="Search local models...">
                    </div>
                    
                    <div class="filter-bar">
                        <div class="filter-chip active" data-filter="all">All</div>
                        <div class="filter-chip" data-filter="ollama">Ollama</div>
                        <div class="filter-chip" data-filter="lmstudio">LM Studio</div>
                        <div class="filter-chip" data-filter="installed">Installed</div>
                        <div class="filter-chip" data-filter="code">Code</div>
                        <div class="filter-chip" data-filter="chat">Chat</div>
                    </div>
                    
                    <div class="model-grid" id="local-models-grid">
                        ${this.generateModelCards(localModels)}
                    </div>
                </div>
                
                <div class="tab-content" id="huggingface-tab">
                    <div class="search-bar">
                        <input type="text" class="search-input" id="huggingface-search" placeholder="Search Hugging Face models...">
                    </div>
                    
                    <div class="filter-bar">
                        <div class="filter-chip active" data-filter="all">All</div>
                        <div class="filter-chip" data-filter="code">Code</div>
                        <div class="filter-chip" data-filter="chat">Chat</div>
                        <div class="filter-chip" data-filter="small">Small Size</div>
                    </div>
                    
                    <div class="model-grid" id="huggingface-models-grid">
                        ${this.generateModelCards(huggingfaceModels)}
                    </div>
                </div>
                
                <div id="install-instructions" class="install-instructions" style="display: none;">
                    <h3>Installation Instructions</h3>
                    <div id="instructions-content"></div>
                </div>
            </div>
            
            <script nonce="${nonce}">
                const vscode = acquireVsCodeApi();
                
                // Check statuses on load
                checkOllamaStatus();
                checkLmStudioStatus();
                
                // Set up tab switching
                document.querySelectorAll('.tab').forEach(tab => {
                    tab.addEventListener('click', () => {
                        // Update active tab
                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
                        tab.classList.add('active');
                        
                        // Show corresponding content
                        const tabId = tab.getAttribute('data-tab');
                        document.querySelectorAll('.tab-content').forEach(content => {
                            content.classList.remove('active');
                        });
                        document.getElementById(tabId + '-tab').classList.add('active');
                    });
                });
                
                // Setup filter chips
                document.querySelectorAll('.filter-chip').forEach(chip => {
                    chip.addEventListener('click', () => {
                        const parentTab = chip.closest('.tab-content');
                        parentTab.querySelectorAll('.filter-chip').forEach(c => {
                            c.classList.remove('active');
                        });
                        chip.classList.add('active');
                        
                        // Apply filter
                        const filter = chip.getAttribute('data-filter');
                        const gridId = parentTab.querySelector('.model-grid').id;
                        applyFilter(gridId, filter);
                    });
                });
                
                // Setup search
                document.getElementById('local-search').addEventListener('input', (e) => {
                    applySearch('local-models-grid', e.target.value);
                });
                document.getElementById('huggingface-search').addEventListener('input', (e) => {
                    applySearch('huggingface-models-grid', e.target.value);
                });
                
                // Setup buttons
                document.getElementById('refresh-status').addEventListener('click', () => {
                    checkOllamaStatus();
                    checkLmStudioStatus();
                    vscode.postMessage({ command: 'refreshModels' });
                });
                
                document.getElementById('install-ollama').addEventListener('click', () => {
                    vscode.postMessage({ command: 'getOllamaInstallInstructions' });
                });
                
                document.getElementById('install-lmstudio').addEventListener('click', () => {
                    vscode.postMessage({ command: 'getLmStudioInstallInstructions' });
                });
                
                document.getElementById('start-ollama').addEventListener('click', () => {
                    vscode.postMessage({ command: 'startOllama' });
                });
                
                // Setup model download buttons
                document.querySelectorAll('.download-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const modelId = button.getAttribute('data-model-id');
                        const provider = button.getAttribute('data-provider');
                        
                        if (provider === 'ollama') {
                            vscode.postMessage({ 
                                command: 'downloadOllamaModel',
                                modelId: modelId
                            });
                        } else if (provider === 'lmstudio') {
                            vscode.postMessage({ 
                                command: 'downloadLmStudioModel',
                                modelId: modelId
                            });
                        } else if (provider === 'huggingface') {
                            vscode.postMessage({ 
                                command: 'openHuggingFace',
                                modelId: modelId
                            });
                        }
                    });
                });
                
                // Setup model select buttons
                document.querySelectorAll('.select-button').forEach(button => {
                    button.addEventListener('click', () => {
                        const modelId = button.getAttribute('data-model-id');
                        const provider = button.getAttribute('data-provider');
                        
                        vscode.postMessage({ 
                            command: 'selectModel',
                            modelId: modelId,
                            provider: provider
                        });
                    });
                });
                
                function checkOllamaStatus() {
                    vscode.postMessage({ command: 'checkOllamaStatus' });
                }
                
                function checkLmStudioStatus() {
                    vscode.postMessage({ command: 'checkLmStudioStatus' });
                }
                
                function applyFilter(gridId, filter) {
                    const cards = document.querySelectorAll('#' + gridId + ' .model-card');
                    
                    cards.forEach(card => {
                        if (filter === 'all') {
                            card.style.display = 'block';
                            return;
                        }
                        
                        if (filter === 'installed' && card.classList.contains('installed')) {
                            card.style.display = 'block';
                            return;
                        }
                        
                        if (filter === 'ollama' && card.getAttribute('data-provider') === 'ollama') {
                            card.style.display = 'block';
                            return;
                        }
                        
                        if (filter === 'lmstudio' && card.getAttribute('data-provider') === 'lmstudio') {
                            card.style.display = 'block';
                            return;
                        }
                        
                        // Tag filters
                        const tags = card.getAttribute('data-tags').split(',');
                        if (tags.includes(filter)) {
                            card.style.display = 'block';
                            return;
                        }
                        
                        card.style.display = 'none';
                    });
                }
                
                function applySearch(gridId, query) {
                    const cards = document.querySelectorAll('#' + gridId + ' .model-card');
                    const lowerQuery = query.toLowerCase();
                    
                    cards.forEach(card => {
                        const name = card.querySelector('.model-name').innerText.toLowerCase();
                        const description = card.querySelector('.model-description').innerText.toLowerCase();
                        const tags = card.getAttribute('data-tags').toLowerCase();
                        
                        if (name.includes(lowerQuery) || description.includes(lowerQuery) || tags.includes(lowerQuery)) {
                            card.style.display = 'block';
                        } else {
                            card.style.display = 'none';
                        }
                    });
                }
                
                // Handle messages from the extension
                window.addEventListener('message', event => {
                    const message = event.data;
                    
                    switch (message.command) {
                        case 'updateOllamaStatus':
                            updateOllamaStatus(message.installed, message.running);
                            break;
                            
                        case 'updateLmStudioStatus':
                            updateLmStudioStatus(message.installed);
                            break;
                            
                        case 'showInstallInstructions':
                            showInstallInstructions(message.content);
                            break;
                    }
                });
                
                function updateOllamaStatus(installed, running) {
                    const statusDot = document.getElementById('ollama-status-dot');
                    const statusText = document.getElementById('ollama-status').querySelector('span');
                    const startButton = document.getElementById('start-ollama');
                    
                    if (!installed) {
                        statusDot.className = 'status-dot not-installed';
                        statusText.textContent = 'Ollama: Not Installed';
                        startButton.disabled = true;
                    } else if (running) {
                        statusDot.className = 'status-dot running';
                        statusText.textContent = 'Ollama: Running';
                        startButton.disabled = true;
                    } else {
                        statusDot.className = 'status-dot stopped';
                        statusText.textContent = 'Ollama: Stopped';
                        startButton.disabled = false;
                    }
                }
                
                function updateLmStudioStatus(installed) {
                    const statusDot = document.getElementById('lmstudio-status-dot');
                    const statusText = document.getElementById('lmstudio-status').querySelector('span');
                    
                    if (installed) {
                        statusDot.className = 'status-dot running';
                        statusText.textContent = 'LM Studio: Installed';
                    } else {
                        statusDot.className = 'status-dot not-installed';
                        statusText.textContent = 'LM Studio: Not Installed';
                    }
                }
                
                function showInstallInstructions(content) {
                    const instructionsDiv = document.getElementById('install-instructions');
                    const contentDiv = document.getElementById('instructions-content');
                    
                    contentDiv.innerHTML = content;
                    instructionsDiv.style.display = 'block';
                    
                    // Scroll to instructions
                    instructionsDiv.scrollIntoView({ behavior: 'smooth' });
                }
            </script>
        </body>
        </html>`;
    }
    /**
     * Generate HTML for model cards
     */
    generateModelCards(models) {
        return models.map(model => {
            const tagsHtml = model.tags ? model.tags.map(tag => `<div class="model-tag">${tag}</div>`).join('') : '';
            return `<div class="model-card ${model.installed ? 'installed' : ''}" data-provider="${model.provider}" data-tags="${model.tags?.join(',') || ''}">
                ${model.installed ? '<div class="installed-tag">Installed</div>' : ''}
                <div class="model-name">${model.name}</div>
                <div class="model-provider">${this.formatProviderName(model.provider)}</div>
                <div class="model-description">${model.description}</div>
                <div class="model-meta">
                    <div>Size: ${model.size || 'Unknown'}</div>
                    <div>${model.license || ''}</div>
                </div>
                <div class="model-tags">
                    ${tagsHtml}
                </div>
                <div class="model-actions">
                    ${model.installed
                ? `<button class="action-button select-button" data-model-id="${model.id}" data-provider="${model.provider}">Select</button>`
                : `<button class="action-button download-button" data-model-id="${model.id}" data-provider="${model.provider}">Download</button>`}
                </div>
            </div>`;
        }).join('');
    }
    /**
     * Format provider name for display
     */
    formatProviderName(provider) {
        switch (provider) {
            case 'ollama':
                return 'Ollama';
            case 'lmstudio':
                return 'LM Studio';
            case 'huggingface':
                return 'Hugging Face';
            default:
                return provider;
        }
    }
    /**
     * Handle messages from the webview
     */
    async handleWebviewMessage(message) {
        switch (message.command) {
            case 'checkOllamaStatus':
                const ollamaStatus = await this.modelsManager.checkOllamaStatus();
                this.panel?.webview.postMessage({
                    command: 'updateOllamaStatus',
                    installed: ollamaStatus.installed,
                    running: ollamaStatus.running
                });
                break;
            case 'checkLmStudioStatus':
                const lmStudioStatus = await this.modelsManager.checkLmStudioStatus();
                this.panel?.webview.postMessage({
                    command: 'updateLmStudioStatus',
                    installed: lmStudioStatus.installed
                });
                break;
            case 'refreshModels':
                await this.modelsManager.refreshInstalledModels();
                break;
            case 'getOllamaInstallInstructions':
                const ollamaInstructions = this.modelsManager.getOllamaInstallInstructions();
                this.panel?.webview.postMessage({
                    command: 'showInstallInstructions',
                    content: `<p>To install Ollama:</p><pre>${ollamaInstructions}</pre><p>After installing, restart this extension to use Ollama.</p>`
                });
                break;
            case 'getLmStudioInstallInstructions':
                const lmStudioInstructions = this.modelsManager.getLmStudioInstallInstructions();
                this.panel?.webview.postMessage({
                    command: 'showInstallInstructions',
                    content: `<p>To install LM Studio:</p><pre>${lmStudioInstructions}</pre><p>After installing, restart this extension to use LM Studio.</p>`
                });
                break;
            case 'startOllama':
                vscode.window.showInformationMessage('Please start Ollama manually. It should be in your applications or you can run "ollama serve" in a terminal.');
                break;
            case 'downloadOllamaModel':
                try {
                    await this.modelsManager.downloadOllamaModel(message.modelId);
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Failed to download model: ${error.message}`);
                }
                break;
            case 'downloadLmStudioModel':
                try {
                    await this.modelsManager.downloadLmStudioModel(message.modelId);
                }
                catch (error) {
                    vscode.window.showErrorMessage(`Failed to download model: ${error.message}`);
                }
                break;
            case 'openHuggingFace':
                vscode.env.openExternal(vscode.Uri.parse(`https://huggingface.co/${message.modelId}`));
                break;
            case 'selectModel':
                // Set the selected model in configuration
                const provider = message.provider;
                const modelId = message.modelId;
                await vscode.workspace.getConfiguration('localLLM').update('provider', provider, vscode.ConfigurationTarget.Global);
                await vscode.workspace.getConfiguration('localLLM').update('modelId', modelId, vscode.ConfigurationTarget.Global);
                vscode.window.showInformationMessage(`Selected model "${modelId}" with provider "${provider}"`);
                break;
        }
    }
    /**
     * Generate a nonce for content security policy
     */
    getNonce() {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }
}
exports.LLMSelectionView = LLMSelectionView;
//# sourceMappingURL=llmSelectionView.js.map