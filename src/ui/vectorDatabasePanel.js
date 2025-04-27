"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.VectorDatabasePanel = void 0;
var vscode = require("vscode");
var manager_1 = require("../services/vectordb/manager");
var codeSearch_1 = require("../services/vectordb/codeSearch");
var VectorDatabasePanel = /** @class */ (function () {
    function VectorDatabasePanel(panel, extensionUri) {
        var _this = this;
        this._disposables = [];
        this._panel = panel;
        // Set the webview's initial html content
        this._update();
        // Listen for when the panel is disposed
        // This happens when the user closes the panel or when the panel is closed programmatically
        this._panel.onDidDispose(function () { return _this.dispose(); }, null, this._disposables);
        // Update the content based on view changes
        this._panel.onDidChangeViewState(function (e) {
            if (_this._panel.visible) {
                _this._update();
            }
        }, null, this._disposables);
        // Handle messages from the webview
        this._panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var manager, searchService, _a, success, error_1, results, error_2, count, error_3, uri, document_1, error_4;
            var _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        manager = (0, manager_1.getVectorDatabaseManager)();
                        searchService = (0, codeSearch_1.getCodeSearchService)();
                        _a = message.command;
                        switch (_a) {
                            case 'getProviders': return [3 /*break*/, 1];
                            case 'setEnabled': return [3 /*break*/, 2];
                            case 'setActiveProvider': return [3 /*break*/, 3];
                            case 'searchCode': return [3 /*break*/, 7];
                            case 'indexWorkspace': return [3 /*break*/, 11];
                            case 'openFile': return [3 /*break*/, 15];
                        }
                        return [3 /*break*/, 20];
                    case 1:
                        this._panel.webview.postMessage({
                            command: 'providersLoaded',
                            providers: manager.getProviders().map(function (p) { return ({
                                name: p.name,
                                isAvailable: p.isAvailable
                            }); }),
                            activeProvider: ((_b = manager.getActiveProvider()) === null || _b === void 0 ? void 0 : _b.name) || null,
                            isEnabled: manager.isVectorDatabaseEnabled()
                        });
                        return [2 /*return*/];
                    case 2:
                        manager.setEnabled(message.enabled);
                        this._panel.webview.postMessage({
                            command: 'statusChanged',
                            isEnabled: manager.isVectorDatabaseEnabled()
                        });
                        return [2 /*return*/];
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, manager.setActiveProvider(message.provider)];
                    case 4:
                        success = _c.sent();
                        if (success) {
                            this._panel.webview.postMessage({
                                command: 'providerChanged',
                                activeProvider: message.provider
                            });
                            vscode.window.showInformationMessage("".concat(message.provider, " is now the active provider"));
                        }
                        else {
                            vscode.window.showErrorMessage("Failed to set ".concat(message.provider, " as active provider"));
                        }
                        return [3 /*break*/, 6];
                    case 5:
                        error_1 = _c.sent();
                        vscode.window.showErrorMessage("Error: ".concat(error_1.message));
                        return [3 /*break*/, 6];
                    case 6: return [2 /*return*/];
                    case 7:
                        _c.trys.push([7, 9, , 10]);
                        return [4 /*yield*/, searchService.semanticSearch(message.query, message.limit)];
                    case 8:
                        results = _c.sent();
                        this._panel.webview.postMessage({
                            command: 'searchResults',
                            results: results
                        });
                        return [3 /*break*/, 10];
                    case 9:
                        error_2 = _c.sent();
                        vscode.window.showErrorMessage("Search failed: ".concat(error_2.message));
                        return [3 /*break*/, 10];
                    case 10: return [2 /*return*/];
                    case 11:
                        _c.trys.push([11, 13, , 14]);
                        return [4 /*yield*/, searchService.indexWorkspace(message.includePattern, message.excludePattern)];
                    case 12:
                        count = _c.sent();
                        vscode.window.showInformationMessage("Successfully indexed ".concat(count, " files"));
                        this._panel.webview.postMessage({
                            command: 'indexingComplete',
                            count: count
                        });
                        return [3 /*break*/, 14];
                    case 13:
                        error_3 = _c.sent();
                        vscode.window.showErrorMessage("Indexing failed: ".concat(error_3.message));
                        return [3 /*break*/, 14];
                    case 14: return [2 /*return*/];
                    case 15:
                        _c.trys.push([15, 18, , 19]);
                        uri = vscode.Uri.parse(message.fileUri);
                        return [4 /*yield*/, vscode.workspace.openTextDocument(uri)];
                    case 16:
                        document_1 = _c.sent();
                        return [4 /*yield*/, vscode.window.showTextDocument(document_1)];
                    case 17:
                        _c.sent();
                        return [3 /*break*/, 19];
                    case 18:
                        error_4 = _c.sent();
                        vscode.window.showErrorMessage("Failed to open file: ".concat(error_4.message));
                        return [3 /*break*/, 19];
                    case 19: return [2 /*return*/];
                    case 20: return [2 /*return*/];
                }
            });
        }); }, null, this._disposables);
    }
    VectorDatabasePanel.createOrShow = function (extensionUri) {
        var column = vscode.window.activeTextEditor
            ? vscode.window.activeTextEditor.viewColumn
            : undefined;
        // If we already have a panel, show it.
        // Otherwise, create a new panel.
        var panel = vscode.window.createWebviewPanel(VectorDatabasePanel.viewType, 'Vector Database', column || vscode.ViewColumn.One, {
            enableScripts: true,
            localResourceRoots: [vscode.Uri.joinPath(extensionUri, 'media')]
        });
        return new VectorDatabasePanel(panel, extensionUri);
    };
    VectorDatabasePanel.prototype._update = function () {
        this._panel.title = "Vector Database";
        this._panel.webview.html = this._getHtmlForWebview();
    };
    VectorDatabasePanel.prototype._getHtmlForWebview = function () {
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>Vector Database</title>\n            <style>\n                body {\n                    font-family: var(--vscode-font-family);\n                    padding: 20px;\n                    color: var(--vscode-foreground);\n                }\n                .container {\n                    display: flex;\n                    flex-direction: column;\n                    height: calc(100vh - 40px);\n                }\n                .settings {\n                    margin-bottom: 20px;\n                    padding-bottom: 20px;\n                    border-bottom: 1px solid var(--vscode-panel-border);\n                }\n                .search-section {\n                    margin-bottom: 20px;\n                }\n                .index-section {\n                    margin-bottom: 20px;\n                }\n                .results-section {\n                    flex: 1;\n                    overflow-y: auto;\n                }\n                .toggle-container {\n                    margin-bottom: 15px;\n                    display: flex;\n                    align-items: center;\n                }\n                .toggle-switch {\n                    position: relative;\n                    display: inline-block;\n                    width: 60px;\n                    height: 34px;\n                    margin-right: 10px;\n                }\n                .toggle-switch input {\n                    opacity: 0;\n                    width: 0;\n                    height: 0;\n                }\n                .slider {\n                    position: absolute;\n                    cursor: pointer;\n                    top: 0;\n                    left: 0;\n                    right: 0;\n                    bottom: 0;\n                    background-color: #ccc;\n                    transition: .4s;\n                    border-radius: 34px;\n                }\n                .slider:before {\n                    position: absolute;\n                    content: \"\";\n                    height: 26px;\n                    width: 26px;\n                    left: 4px;\n                    bottom: 4px;\n                    background-color: white;\n                    transition: .4s;\n                    border-radius: 50%;\n                }\n                input:checked + .slider {\n                    background-color: #2196F3;\n                }\n                input:checked + .slider:before {\n                    transform: translateX(26px);\n                }\n                select, input[type=\"text\"], input[type=\"number\"] {\n                    padding: 8px;\n                    margin-bottom: 10px;\n                    width: 100%;\n                    background-color: var(--vscode-input-background);\n                    color: var(--vscode-input-foreground);\n                    border: 1px solid var(--vscode-input-border);\n                    border-radius: 2px;\n                }\n                button {\n                    padding: 8px 16px;\n                    background-color: var(--vscode-button-background);\n                    color: var(--vscode-button-foreground);\n                    border: none;\n                    border-radius: 2px;\n                    cursor: pointer;\n                }\n                button:hover {\n                    background-color: var(--vscode-button-hoverBackground);\n                }\n                button:disabled {\n                    opacity: 0.5;\n                    cursor: not-allowed;\n                }\n                .form-group {\n                    margin-bottom: 15px;\n                }\n                label {\n                    display: block;\n                    margin-bottom: 5px;\n                }\n                .result-item {\n                    margin-bottom: 20px;\n                    padding: 10px;\n                    border: 1px solid var(--vscode-panel-border);\n                    border-radius: 4px;\n                }\n                .result-header {\n                    display: flex;\n                    justify-content: space-between;\n                    align-items: center;\n                    margin-bottom: 10px;\n                }\n                .result-path {\n                    font-size: 0.9em;\n                    color: var(--vscode-descriptionForeground);\n                    margin-bottom: 5px;\n                    cursor: pointer;\n                }\n                .result-path:hover {\n                    text-decoration: underline;\n                }\n                .result-score {\n                    font-size: 0.9em;\n                    background-color: var(--vscode-badge-background);\n                    color: var(--vscode-badge-foreground);\n                    padding: 2px 6px;\n                    border-radius: 10px;\n                }\n                .result-content {\n                    white-space: pre-wrap;\n                    overflow-x: auto;\n                    background-color: var(--vscode-editor-background);\n                    padding: 10px;\n                    border-radius: 2px;\n                    font-family: var(--vscode-editor-font-family);\n                    font-size: var(--vscode-editor-font-size);\n                }\n                .hidden {\n                    display: none;\n                }\n            </style>\n        </head>\n        <body>\n            <div class=\"container\">\n                <div class=\"settings\">\n                    <h2>Vector Database Settings</h2>\n                    \n                    <div class=\"toggle-container\">\n                        <label class=\"toggle-switch\">\n                            <input type=\"checkbox\" id=\"enabledToggle\">\n                            <span class=\"slider\"></span>\n                        </label>\n                        <span id=\"statusText\">Vector Database: Disabled</span>\n                    </div>\n                    \n                    <div id=\"providerSettings\" class=\"hidden\">\n                        <div class=\"form-group\">\n                            <label for=\"providerSelect\">Select Provider:</label>\n                            <select id=\"providerSelect\">\n                                <!-- Providers will be loaded here -->\n                            </select>\n                        </div>\n                    </div>\n                </div>\n                \n                <div id=\"functionalitySection\" class=\"hidden\">\n                    <div class=\"search-section\">\n                        <h2>Semantic Code Search</h2>\n                        <div class=\"form-group\">\n                            <label for=\"searchQuery\">Search Query:</label>\n                            <input type=\"text\" id=\"searchQuery\" placeholder=\"Describe what you're looking for...\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label for=\"resultLimit\">Result Limit:</label>\n                            <input type=\"number\" id=\"resultLimit\" value=\"5\" min=\"1\" max=\"20\">\n                        </div>\n                        <button id=\"searchButton\">Search</button>\n                    </div>\n                    \n                    <div class=\"index-section\">\n                        <h2>Index Workspace</h2>\n                        <div class=\"form-group\">\n                            <label for=\"includePattern\">Include Pattern:</label>\n                            <input type=\"text\" id=\"includePattern\" value=\"**/*.{js,ts,jsx,tsx,py,java,c,cpp,h,hpp,cs,go,rust}\" placeholder=\"Glob pattern for files to include\">\n                        </div>\n                        <div class=\"form-group\">\n                            <label for=\"excludePattern\">Exclude Pattern:</label>\n                            <input type=\"text\" id=\"excludePattern\" value=\"**/node_modules/**,**/dist/**,**/build/**,**/.git/**\" placeholder=\"Glob pattern for files to exclude\">\n                        </div>\n                        <button id=\"indexButton\">Index Workspace</button>\n                    </div>\n                </div>\n                \n                <div class=\"results-section\">\n                    <h2>Search Results</h2>\n                    <div id=\"resultsContainer\">\n                        <!-- Results will be displayed here -->\n                        <div id=\"emptyResults\">No results to display. Try searching for something.</div>\n                    </div>\n                </div>\n            </div>\n\n            <script>\n                (function() {\n                    const vscode = acquireVsCodeApi();\n                    \n                    // DOM elements\n                    const enabledToggle = document.getElementById('enabledToggle');\n                    const statusText = document.getElementById('statusText');\n                    const providerSettings = document.getElementById('providerSettings');\n                    const providerSelect = document.getElementById('providerSelect');\n                    const functionalitySection = document.getElementById('functionalitySection');\n                    const searchQuery = document.getElementById('searchQuery');\n                    const resultLimit = document.getElementById('resultLimit');\n                    const searchButton = document.getElementById('searchButton');\n                    const includePattern = document.getElementById('includePattern');\n                    const excludePattern = document.getElementById('excludePattern');\n                    const indexButton = document.getElementById('indexButton');\n                    const resultsContainer = document.getElementById('resultsContainer');\n                    const emptyResults = document.getElementById('emptyResults');\n                    \n                    // State\n                    let isEnabled = false;\n                    let activeProvider = null;\n                    let providers = [];\n                    \n                    // Initialize\n                    function initialize() {\n                        // Get provider information\n                        vscode.postMessage({ command: 'getProviders' });\n                        \n                        // Attach event listeners\n                        enabledToggle.addEventListener('change', onToggleChanged);\n                        providerSelect.addEventListener('change', onProviderChanged);\n                        searchButton.addEventListener('click', onSearch);\n                        indexButton.addEventListener('click', onIndexWorkspace);\n                    }\n                    \n                    // Handle toggle change\n                    function onToggleChanged() {\n                        isEnabled = enabledToggle.checked;\n                        vscode.postMessage({\n                            command: 'setEnabled',\n                            enabled: isEnabled\n                        });\n                        \n                        updateUI();\n                    }\n                    \n                    // Handle provider change\n                    function onProviderChanged() {\n                        const selectedProvider = providerSelect.value;\n                        if (selectedProvider && selectedProvider !== activeProvider) {\n                            vscode.postMessage({\n                                command: 'setActiveProvider',\n                                provider: selectedProvider\n                            });\n                        }\n                    }\n                    \n                    // Handle search button click\n                    function onSearch() {\n                        const query = searchQuery.value.trim();\n                        const limit = parseInt(resultLimit.value, 10) || 5;\n                        \n                        if (!query) {\n                            vscode.postMessage({\n                                type: 'error',\n                                message: 'Please enter a search query'\n                            });\n                            return;\n                        }\n                        \n                        vscode.postMessage({\n                            command: 'searchCode',\n                            query,\n                            limit\n                        });\n                        \n                        // Clear previous results\n                        while (resultsContainer.firstChild) {\n                            resultsContainer.removeChild(resultsContainer.firstChild);\n                        }\n                        \n                        // Show loading indicator\n                        const loadingEl = document.createElement('div');\n                        loadingEl.textContent = 'Searching...';\n                        loadingEl.id = 'loadingIndicator';\n                        resultsContainer.appendChild(loadingEl);\n                        \n                        emptyResults.classList.add('hidden');\n                    }\n                    \n                    // Handle index workspace button click\n                    function onIndexWorkspace() {\n                        const includePatternValue = includePattern.value.trim();\n                        const excludePatternValue = excludePattern.value.trim();\n                        \n                        vscode.postMessage({\n                            command: 'indexWorkspace',\n                            includePattern: includePatternValue,\n                            excludePattern: excludePatternValue\n                        });\n                        \n                        // Disable button while indexing\n                        indexButton.disabled = true;\n                        indexButton.textContent = 'Indexing...';\n                    }\n                    \n                    // Update UI based on current state\n                    function updateUI() {\n                        statusText.textContent = 'Vector Database: ' + (isEnabled ? 'Enabled' : 'Disabled');\n                        \n                        if (isEnabled) {\n                            providerSettings.classList.remove('hidden');\n                            functionalitySection.classList.remove('hidden');\n                        } else {\n                            providerSettings.classList.add('hidden');\n                            functionalitySection.classList.add('hidden');\n                        }\n                    }\n                    \n                    // Populate provider dropdown\n                    function populateProviders() {\n                        providerSelect.innerHTML = '';\n                        \n                        providers.forEach(provider => {\n                            const option = document.createElement('option');\n                            option.value = provider.name;\n                            option.textContent = provider.name;\n                            option.disabled = !provider.isAvailable;\n                            \n                            if (provider.name === activeProvider) {\n                                option.selected = true;\n                            }\n                            \n                            providerSelect.appendChild(option);\n                        });\n                    }\n                    \n                    // Display search results\n                    function displayResults(results) {\n                        // Remove loading indicator\n                        const loadingIndicator = document.getElementById('loadingIndicator');\n                        if (loadingIndicator) {\n                            loadingIndicator.remove();\n                        }\n                        \n                        // Clear previous results\n                        while (resultsContainer.firstChild) {\n                            resultsContainer.removeChild(resultsContainer.firstChild);\n                        }\n                        \n                        if (results.length === 0) {\n                            emptyResults.classList.remove('hidden');\n                            emptyResults.textContent = 'No results found for your query.';\n                            resultsContainer.appendChild(emptyResults);\n                            return;\n                        }\n                        \n                        emptyResults.classList.add('hidden');\n                        \n                        // Add results\n                        results.forEach(result => {\n                            const resultItem = document.createElement('div');\n                            resultItem.className = 'result-item';\n                            \n                            const resultHeader = document.createElement('div');\n                            resultHeader.className = 'result-header';\n                            \n                            const resultPath = document.createElement('div');\n                            resultPath.className = 'result-path';\n                            resultPath.textContent = result.document.metadata.path || 'Unknown path';\n                            resultPath.addEventListener('click', () => {\n                                vscode.postMessage({\n                                    command: 'openFile',\n                                    fileUri: result.document.id\n                                });\n                            });\n                            \n                            const resultScore = document.createElement('div');\n                            resultScore.className = 'result-score';\n                            resultScore.textContent = 'Score: ' + result.score.toFixed(2);\n                            \n                            resultHeader.appendChild(resultPath);\n                            resultHeader.appendChild(resultScore);\n                            \n                            const resultContent = document.createElement('pre');\n                            resultContent.className = 'result-content';\n                            \n                            // Limit content length to avoid huge blocks\n                            let content = result.document.content;\n                            if (content.length > 1000) {\n                                content = content.substring(0, 1000) + '...';\n                            }\n                            \n                            resultContent.textContent = content;\n                            \n                            resultItem.appendChild(resultHeader);\n                            resultItem.appendChild(resultContent);\n                            \n                            resultsContainer.appendChild(resultItem);\n                        });\n                    }\n                    \n                    // Handle messages from extension\n                    window.addEventListener('message', event => {\n                        const message = event.data;\n                        \n                        switch (message.command) {\n                            case 'providersLoaded':\n                                providers = message.providers;\n                                activeProvider = message.activeProvider;\n                                isEnabled = message.isEnabled;\n                                \n                                enabledToggle.checked = isEnabled;\n                                populateProviders();\n                                updateUI();\n                                break;\n                                \n                            case 'statusChanged':\n                                isEnabled = message.isEnabled;\n                                updateUI();\n                                break;\n                                \n                            case 'providerChanged':\n                                activeProvider = message.activeProvider;\n                                populateProviders();\n                                break;\n                                \n                            case 'searchResults':\n                                displayResults(message.results);\n                                break;\n                                \n                            case 'indexingComplete':\n                                indexButton.disabled = false;\n                                indexButton.textContent = 'Index Workspace';\n                                break;\n                        }\n                    });\n                    \n                    // Initialize on load\n                    initialize();\n                })();\n            </script>\n        </body>\n        </html>";
    };
    VectorDatabasePanel.prototype.dispose = function () {
        // Clean up resources
        this._panel.dispose();
        while (this._disposables.length) {
            var x = this._disposables.pop();
            if (x) {
                x.dispose();
            }
        }
    };
    VectorDatabasePanel.viewType = 'copilotPPA.vectorDatabasePanel';
    return VectorDatabasePanel;
}());
exports.VectorDatabasePanel = VectorDatabasePanel;
