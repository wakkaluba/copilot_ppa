import * as vscode from 'vscode';
import { getCodeSearchService } from '../services/vectordb/codeSearch';
import { getVectorDatabaseManager } from '../services/vectordb/manager';

export class VectorDatabasePanel {
    public static readonly viewType = 'copilotPPA.vectorDatabasePanel';
    private readonly _panel: vscode.WebviewPanel;
    private _disposables: vscode.Disposable[] = [];

    public static createOrShow(extensionUri: vscode.Uri) {
        const column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;

        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        const panel = vscode.window.createWebviewPanel(
            VectorDatabasePanel.viewType,
            'Vector Database',
            column || vscode.ViewColumn.One,
            {
                enableScripts: true,
                localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
            }
        );

        return new VectorDatabasePanel(panel, extensionUri);
    }

    private constructor(panel: vscode.WebviewPanel, extensionUri: vscode.Uri) {
        this._panel = panel;

        // Set the webview's initial html content
        this._update();

        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

        // Update the content based on view changes
        this._panel.onDidChangeViewState(
            e => {
                if (this._panel.visible) {
                    this._update();
                }
            },
            null,
            this._disposables
        );

        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(
            async message => {
                const manager = getVectorDatabaseManager();
                const searchService = getCodeSearchService();

                switch (message.command) {
                    case 'getProviders':
                        this._panel.webview.postMessage({
                            command: 'providersLoaded',
                            providers: manager.getProviders().map(p => ({
                                name: p.name,
                                isAvailable: p.isAvailable
                            })),
                            activeProvider: manager.getActiveProvider()?.name || null,
                            isEnabled: manager.isVectorDatabaseEnabled()
                        });
                        return;

                    case 'setEnabled':
                        manager.setEnabled(message.enabled);
                        this._panel.webview.postMessage({
                            command: 'statusChanged',
                            isEnabled: manager.isVectorDatabaseEnabled()
                        });
                        return;

                    case 'setActiveProvider':
                        try {
                            const success = await manager.setActiveProvider(message.provider);
                            if (success) {
                                this._panel.webview.postMessage({
                                    command: 'providerChanged',
                                    activeProvider: message.provider
                                });
                                vscode.window.showInformationMessage(`${message.provider} is now the active provider`);
                            } else {
                                vscode.window.showErrorMessage(`Failed to set ${message.provider} as active provider`);
                            }
                        } catch (error) {
                            vscode.window.showErrorMessage(`Error: ${error instanceof Error ? error.message : String(error)}`);
                        }
                        return;

                    case 'searchCode':
                        try {
                            const results = await searchService.semanticSearch(message.query, message.limit);
                            this._panel.webview.postMessage({
                                command: 'searchResults',
                                results
                            });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Search failed: ${error instanceof Error ? error.message : String(error)}`);
                        }
                        return;

                    case 'indexWorkspace':
                        try {
                            const count = await searchService.indexWorkspace(
                                message.includePattern,
                                message.excludePattern
                            );
                            vscode.window.showInformationMessage(`Successfully indexed ${count} files`);
                            this._panel.webview.postMessage({
                                command: 'indexingComplete',
                                count
                            });
                        } catch (error) {
                            vscode.window.showErrorMessage(`Indexing failed: ${error instanceof Error ? error.message : String(error)}`);
                        }
                        return;

                    case 'openFile':
                        try {
                            const uri = vscode.Uri.parse(message.fileUri);
                            const document = await vscode.workspace.openTextDocument(uri);
                            await vscode.window.showTextDocument(document);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Failed to open file: ${error instanceof Error ? error.message : String(error)}`);
                        }
                        return;
                }
            },
            null,
            this._disposables
        );
    }

    private _update() {
        this._panel.title = "Vector Database";
        this._panel.webview.html = this._getHtmlForWebview();
    }

    private _getHtmlForWebview() {
        return `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Vector Database</title>
            <style>
                body {
                    font-family: var(--vscode-font-family);
                    padding: 20px;
                    color: var(--vscode-foreground);
                }
                .container {
                    display: flex;
                    flex-direction: column;
                    height: calc(100vh - 40px);
                }
                .settings {
                    margin-bottom: 20px;
                    padding-bottom: 20px;
                    border-bottom: 1px solid var(--vscode-panel-border);
                }
                .search-section {
                    margin-bottom: 20px;
                }
                .index-section {
                    margin-bottom: 20px;
                }
                .results-section {
                    flex: 1;
                    overflow-y: auto;
                }
                .toggle-container {
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                }
                .toggle-switch {
                    position: relative;
                    display: inline-block;
                    width: 60px;
                    height: 34px;
                    margin-right: 10px;
                }
                .toggle-switch input {
                    opacity: 0;
                    width: 0;
                    height: 0;
                }
                .slider {
                    position: absolute;
                    cursor: pointer;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: #ccc;
                    transition: .4s;
                    border-radius: 34px;
                }
                .slider:before {
                    position: absolute;
                    content: "";
                    height: 26px;
                    width: 26px;
                    left: 4px;
                    bottom: 4px;
                    background-color: white;
                    transition: .4s;
                    border-radius: 50%;
                }
                input:checked + .slider {
                    background-color: #2196F3;
                }
                input:checked + .slider:before {
                    transform: translateX(26px);
                }
                select, input[type="text"], input[type="number"] {
                    padding: 8px;
                    margin-bottom: 10px;
                    width: 100%;
                    background-color: var(--vscode-input-background);
                    color: var(--vscode-input-foreground);
                    border: 1px solid var(--vscode-input-border);
                    border-radius: 2px;
                }
                button {
                    padding: 8px 16px;
                    background-color: var(--vscode-button-background);
                    color: var(--vscode-button-foreground);
                    border: none;
                    border-radius: 2px;
                    cursor: pointer;
                }
                button:hover {
                    background-color: var(--vscode-button-hoverBackground);
                }
                button:disabled {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
                .form-group {
                    margin-bottom: 15px;
                }
                label {
                    display: block;
                    margin-bottom: 5px;
                }
                .result-item {
                    margin-bottom: 20px;
                    padding: 10px;
                    border: 1px solid var(--vscode-panel-border);
                    border-radius: 4px;
                }
                .result-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 10px;
                }
                .result-path {
                    font-size: 0.9em;
                    color: var(--vscode-descriptionForeground);
                    margin-bottom: 5px;
                    cursor: pointer;
                }
                .result-path:hover {
                    text-decoration: underline;
                }
                .result-score {
                    font-size: 0.9em;
                    background-color: var(--vscode-badge-background);
                    color: var(--vscode-badge-foreground);
                    padding: 2px 6px;
                    border-radius: 10px;
                }
                .result-content {
                    white-space: pre-wrap;
                    overflow-x: auto;
                    background-color: var(--vscode-editor-background);
                    padding: 10px;
                    border-radius: 2px;
                    font-family: var(--vscode-editor-font-family);
                    font-size: var(--vscode-editor-font-size);
                }
                .hidden {
                    display: none;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="settings">
                    <h2>Vector Database Settings</h2>

                    <div class="toggle-container">
                        <label class="toggle-switch">
                            <input type="checkbox" id="enabledToggle">
                            <span class="slider"></span>
                        </label>
                        <span id="statusText">Vector Database: Disabled</span>
                    </div>

                    <div id="providerSettings" class="hidden">
                        <div class="form-group">
                            <label for="providerSelect">Select Provider:</label>
                            <select id="providerSelect">
                                <!-- Providers will be loaded here -->
                            </select>
                        </div>
                    </div>
                </div>

                <div id="functionalitySection" class="hidden">
                    <div class="search-section">
                        <h2>Semantic Code Search</h2>
                        <div class="form-group">
                            <label for="searchQuery">Search Query:</label>
                            <input type="text" id="searchQuery" placeholder="Describe what you're looking for...">
                        </div>
                        <div class="form-group">
                            <label for="resultLimit">Result Limit:</label>
                            <input type="number" id="resultLimit" value="5" min="1" max="20">
                        </div>
                        <button id="searchButton">Search</button>
                    </div>

                    <div class="index-section">
                        <h2>Index Workspace</h2>
                        <div class="form-group">
                            <label for="includePattern">Include Pattern:</label>
                            <input type="text" id="includePattern" value="**/*.{js,ts,jsx,tsx,py,java,c,cpp,h,hpp,cs,go,rust}" placeholder="Glob pattern for files to include">
                        </div>
                        <div class="form-group">
                            <label for="excludePattern">Exclude Pattern:</label>
                            <input type="text" id="excludePattern" value="**/node_modules/**,**/dist/**,**/build/**,**/.git/**" placeholder="Glob pattern for files to exclude">
                        </div>
                        <button id="indexButton">Index Workspace</button>
                    </div>
                </div>

                <div class="results-section">
                    <h2>Search Results</h2>
                    <div id="resultsContainer">
                        <!-- Results will be displayed here -->
                        <div id="emptyResults">No results to display. Try searching for something.</div>
                    </div>
                </div>
            </div>

            <script>
                (function() {
                    const vscode = acquireVsCodeApi();

                    // DOM elements
                    const enabledToggle = document.getElementById('enabledToggle');
                    const statusText = document.getElementById('statusText');
                    const providerSettings = document.getElementById('providerSettings');
                    const providerSelect = document.getElementById('providerSelect');
                    const functionalitySection = document.getElementById('functionalitySection');
                    const searchQuery = document.getElementById('searchQuery');
                    const resultLimit = document.getElementById('resultLimit');
                    const searchButton = document.getElementById('searchButton');
                    const includePattern = document.getElementById('includePattern');
                    const excludePattern = document.getElementById('excludePattern');
                    const indexButton = document.getElementById('indexButton');
                    const resultsContainer = document.getElementById('resultsContainer');
                    const emptyResults = document.getElementById('emptyResults');

                    // State
                    let isEnabled = false;
                    let activeProvider = null;
                    let providers = [];

                    // Initialize
                    function initialize() {
                        // Get provider information
                        vscode.postMessage({ command: 'getProviders' });

                        // Attach event listeners
                        enabledToggle.addEventListener('change', onToggleChanged);
                        providerSelect.addEventListener('change', onProviderChanged);
                        searchButton.addEventListener('click', onSearch);
                        indexButton.addEventListener('click', onIndexWorkspace);
                    }

                    // Handle toggle change
                    function onToggleChanged() {
                        isEnabled = enabledToggle.checked;
                        vscode.postMessage({
                            command: 'setEnabled',
                            enabled: isEnabled
                        });

                        updateUI();
                    }

                    // Handle provider change
                    function onProviderChanged() {
                        const selectedProvider = providerSelect.value;
                        if (selectedProvider && selectedProvider !== activeProvider) {
                            vscode.postMessage({
                                command: 'setActiveProvider',
                                provider: selectedProvider
                            });
                        }
                    }

                    // Handle search button click
                    function onSearch() {
                        const query = searchQuery.value.trim();
                        const limit = parseInt(resultLimit.value, 10) || 5;

                        if (!query) {
                            vscode.postMessage({
                                type: 'error',
                                message: 'Please enter a search query'
                            });
                            return;
                        }

                        vscode.postMessage({
                            command: 'searchCode',
                            query,
                            limit
                        });

                        // Clear previous results
                        while (resultsContainer.firstChild) {
                            resultsContainer.removeChild(resultsContainer.firstChild);
                        }

                        // Show loading indicator
                        const loadingEl = document.createElement('div');
                        loadingEl.textContent = 'Searching...';
                        loadingEl.id = 'loadingIndicator';
                        resultsContainer.appendChild(loadingEl);

                        emptyResults.classList.add('hidden');
                    }

                    // Handle index workspace button click
                    function onIndexWorkspace() {
                        const includePatternValue = includePattern.value.trim();
                        const excludePatternValue = excludePattern.value.trim();

                        vscode.postMessage({
                            command: 'indexWorkspace',
                            includePattern: includePatternValue,
                            excludePattern: excludePatternValue
                        });

                        // Disable button while indexing
                        indexButton.disabled = true;
                        indexButton.textContent = 'Indexing...';
                    }

                    // Update UI based on current state
                    function updateUI() {
                        statusText.textContent = 'Vector Database: ' + (isEnabled ? 'Enabled' : 'Disabled');

                        if (isEnabled) {
                            providerSettings.classList.remove('hidden');
                            functionalitySection.classList.remove('hidden');
                        } else {
                            providerSettings.classList.add('hidden');
                            functionalitySection.classList.add('hidden');
                        }
                    }

                    // Populate provider dropdown
                    function populateProviders() {
                        providerSelect.innerHTML = '';

                        providers.forEach(provider => {
                            const option = document.createElement('option');
                            option.value = provider.name;
                            option.textContent = provider.name;
                            option.disabled = !provider.isAvailable;

                            if (provider.name === activeProvider) {
                                option.selected = true;
                            }

                            providerSelect.appendChild(option);
                        });
                    }

                    // Display search results
                    function displayResults(results) {
                        // Remove loading indicator
                        const loadingIndicator = document.getElementById('loadingIndicator');
                        if (loadingIndicator) {
                            loadingIndicator.remove();
                        }

                        // Clear previous results
                        while (resultsContainer.firstChild) {
                            resultsContainer.removeChild(resultsContainer.firstChild);
                        }

                        if (results.length === 0) {
                            emptyResults.classList.remove('hidden');
                            emptyResults.textContent = 'No results found for your query.';
                            resultsContainer.appendChild(emptyResults);
                            return;
                        }

                        emptyResults.classList.add('hidden');

                        // Add results
                        results.forEach(result => {
                            const resultItem = document.createElement('div');
                            resultItem.className = 'result-item';

                            const resultHeader = document.createElement('div');
                            resultHeader.className = 'result-header';

                            const resultPath = document.createElement('div');
                            resultPath.className = 'result-path';
                            resultPath.textContent = result.document.metadata.path || 'Unknown path';
                            resultPath.addEventListener('click', () => {
                                vscode.postMessage({
                                    command: 'openFile',
                                    fileUri: result.document.id
                                });
                            });

                            const resultScore = document.createElement('div');
                            resultScore.className = 'result-score';
                            resultScore.textContent = 'Score: ' + result.score.toFixed(2);

                            resultHeader.appendChild(resultPath);
                            resultHeader.appendChild(resultScore);

                            const resultContent = document.createElement('pre');
                            resultContent.className = 'result-content';

                            // Limit content length to avoid huge blocks
                            let content = result.document.content;
                            if (content.length > 1000) {
                                content = content.substring(0, 1000) + '...';
                            }

                            resultContent.textContent = content;

                            resultItem.appendChild(resultHeader);
                            resultItem.appendChild(resultContent);

                            resultsContainer.appendChild(resultItem);
                        });
                    }

                    // Handle messages from extension
                    window.addEventListener('message', event => {
                        const message = event.data;

                        switch (message.command) {
                            case 'providersLoaded':
                                providers = message.providers;
                                activeProvider = message.activeProvider;
                                isEnabled = message.isEnabled;

                                enabledToggle.checked = isEnabled;
                                populateProviders();
                                updateUI();
                                break;

                            case 'statusChanged':
                                isEnabled = message.isEnabled;
                                updateUI();
                                break;

                            case 'providerChanged':
                                activeProvider = message.activeProvider;
                                populateProviders();
                                break;

                            case 'searchResults':
                                displayResults(message.results);
                                break;

                            case 'indexingComplete':
                                indexButton.disabled = false;
                                indexButton.textContent = 'Index Workspace';
                                break;
                        }
                    });

                    // Initialize on load
                    initialize();
                })();
            </script>
        </body>
        </html>`;
    }

    public dispose() {
        // Clean up resources
        this._panel.dispose();

        while (this._disposables.length) {
            const x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    }
}
