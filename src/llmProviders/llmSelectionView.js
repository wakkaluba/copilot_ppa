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
exports.LLMSelectionView = void 0;
var vscode = require("vscode");
var LLMSelectionView = /** @class */ (function () {
    function LLMSelectionView(context, modelsManager) {
        var _this = this;
        this.context = context;
        this.modelsManager = modelsManager;
        // Listen for model changes
        this.modelsManager.onModelsChanged(function () {
            if (_this.panel) {
                _this.updateView();
            }
        });
    }
    /**
     * Show the LLM selection view
     */
    LLMSelectionView.prototype.show = function () {
        var _this = this;
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
        this.panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.handleWebviewMessage(message)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }); }, null, this.context.subscriptions);
        // Update the view content
        this.updateView();
        // Clean up when the panel is closed
        this.panel.onDidDispose(function () {
            _this.panel = undefined;
        }, null, this.context.subscriptions);
    };
    /**
     * Update the webview content
     */
    LLMSelectionView.prototype.updateView = function () {
        if (!this.panel) {
            return;
        }
        this.panel.webview.html = this.getWebviewContent();
    };
    /**
     * Generate the HTML content for the webview
     */
    LLMSelectionView.prototype.getWebviewContent = function () {
        var localModels = this.modelsManager.getLocalModels();
        var huggingfaceModels = this.modelsManager.getHuggingFaceModels();
        var nonce = this.getNonce();
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>LLM Model Selection</title>\n            <style>\n                body {\n                    font-family: var(--vscode-font-family);\n                    padding: 20px;\n                    color: var(--vscode-foreground);\n                    background-color: var(--vscode-editor-background);\n                }\n                .container {\n                    max-width: 100%;\n                }\n                h1 {\n                    font-size: 24px;\n                    margin-bottom: 20px;\n                    border-bottom: 1px solid var(--vscode-panel-border);\n                    padding-bottom: 10px;\n                }\n                h2 {\n                    font-size: 18px;\n                    margin-top: 30px;\n                    margin-bottom: 15px;\n                    border-bottom: 1px solid var(--vscode-panel-border);\n                    padding-bottom: 8px;\n                }\n                .status-bar {\n                    background-color: var(--vscode-editor-lineHighlightBackground);\n                    padding: 10px;\n                    margin-bottom: 20px;\n                    border-radius: 4px;\n                    display: flex;\n                    justify-content: space-between;\n                    align-items: center;\n                }\n                .status-indicator {\n                    display: flex;\n                    align-items: center;\n                }\n                .status-dot {\n                    width: 12px;\n                    height: 12px;\n                    border-radius: 50%;\n                    margin-right: 8px;\n                }\n                .status-dot.running {\n                    background-color: #4CAF50;\n                }\n                .status-dot.stopped {\n                    background-color: #F44336;\n                }\n                .status-dot.not-installed {\n                    background-color: #9E9E9E;\n                }\n                .action-button {\n                    background-color: var(--vscode-button-background);\n                    color: var(--vscode-button-foreground);\n                    border: none;\n                    padding: 6px 12px;\n                    border-radius: 2px;\n                    cursor: pointer;\n                    margin-left: 10px;\n                }\n                .action-button:hover {\n                    background-color: var(--vscode-button-hoverBackground);\n                }\n                .action-button:disabled {\n                    opacity: 0.6;\n                    cursor: not-allowed;\n                }\n                .model-grid {\n                    display: grid;\n                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));\n                    gap: 16px;\n                    margin-top: 20px;\n                }\n                .model-card {\n                    border: 1px solid var(--vscode-panel-border);\n                    border-radius: 4px;\n                    padding: 15px;\n                    position: relative;\n                }\n                .model-card.installed {\n                    border-color: #4CAF50;\n                    border-width: 2px;\n                }\n                .installed-tag {\n                    position: absolute;\n                    top: 10px;\n                    right: 10px;\n                    background-color: #4CAF50;\n                    color: white;\n                    padding: 2px 8px;\n                    border-radius: 10px;\n                    font-size: 12px;\n                }\n                .model-name {\n                    font-weight: bold;\n                    font-size: 16px;\n                    margin-bottom: 5px;\n                }\n                .model-provider {\n                    font-size: 12px;\n                    color: var(--vscode-descriptionForeground);\n                    margin-bottom: 10px;\n                }\n                .model-description {\n                    margin-bottom: 10px;\n                    font-size: 14px;\n                }\n                .model-meta {\n                    display: flex;\n                    justify-content: space-between;\n                    font-size: 12px;\n                    color: var(--vscode-descriptionForeground);\n                    margin-bottom: 15px;\n                }\n                .model-tags {\n                    display: flex;\n                    flex-wrap: wrap;\n                    gap: 5px;\n                    margin-bottom: 15px;\n                }\n                .model-tag {\n                    background-color: var(--vscode-editor-lineHighlightBackground);\n                    border-radius: 10px;\n                    padding: 2px 8px;\n                    font-size: 12px;\n                }\n                .model-actions {\n                    display: flex;\n                    justify-content: flex-end;\n                }\n                .tabs {\n                    display: flex;\n                    border-bottom: 1px solid var(--vscode-panel-border);\n                    margin-bottom: 20px;\n                }\n                .tab {\n                    padding: 10px 20px;\n                    cursor: pointer;\n                    border-bottom: 2px solid transparent;\n                }\n                .tab.active {\n                    border-bottom-color: var(--vscode-focusBorder);\n                    font-weight: bold;\n                }\n                .tab-content {\n                    display: none;\n                }\n                .tab-content.active {\n                    display: block;\n                }\n                .search-bar {\n                    margin-bottom: 20px;\n                    width: 100%;\n                }\n                .search-input {\n                    width: 100%;\n                    padding: 8px;\n                    border: 1px solid var(--vscode-input-border);\n                    background-color: var(--vscode-input-background);\n                    color: var(--vscode-input-foreground);\n                    border-radius: 4px;\n                }\n                .filter-bar {\n                    display: flex;\n                    flex-wrap: wrap;\n                    gap: 10px;\n                    margin-bottom: 15px;\n                }\n                .filter-chip {\n                    background-color: var(--vscode-editor-lineHighlightBackground);\n                    border-radius: 15px;\n                    padding: 5px 12px;\n                    cursor: pointer;\n                    font-size: 13px;\n                }\n                .filter-chip.active {\n                    background-color: var(--vscode-button-background);\n                    color: var(--vscode-button-foreground);\n                }\n                .install-instructions {\n                    background-color: var(--vscode-editor-lineHighlightBackground);\n                    padding: 15px;\n                    border-radius: 4px;\n                    margin-top: 15px;\n                    font-size: 14px;\n                }\n                .install-instructions pre {\n                    background-color: var(--vscode-editor-background);\n                    padding: 10px;\n                    border-radius: 4px;\n                    overflow-x: auto;\n                    margin-top: 10px;\n                }\n            </style>\n        </head>\n        <body>\n            <div class=\"container\">\n                <h1>LLM Model Selection</h1>\n                \n                <div class=\"status-bar\">\n                    <div class=\"status-indicator\" id=\"ollama-status\">\n                        <div class=\"status-dot\" id=\"ollama-status-dot\"></div>\n                        <span>Ollama: Checking...</span>\n                    </div>\n                    <div>\n                        <button class=\"action-button\" id=\"refresh-status\">Refresh Status</button>\n                        <button class=\"action-button\" id=\"install-ollama\">Install Ollama</button>\n                        <button class=\"action-button\" id=\"start-ollama\" disabled>Start Ollama</button>\n                    </div>\n                </div>\n                \n                <div class=\"status-bar\">\n                    <div class=\"status-indicator\" id=\"lmstudio-status\">\n                        <div class=\"status-dot\" id=\"lmstudio-status-dot\"></div>\n                        <span>LM Studio: Checking...</span>\n                    </div>\n                    <div>\n                        <button class=\"action-button\" id=\"install-lmstudio\">Install LM Studio</button>\n                    </div>\n                </div>\n                \n                <div class=\"tabs\">\n                    <div class=\"tab active\" data-tab=\"local\">Local Models</div>\n                    <div class=\"tab\" data-tab=\"huggingface\">Hugging Face Models</div>\n                </div>\n                \n                <div class=\"tab-content active\" id=\"local-tab\">\n                    <div class=\"search-bar\">\n                        <input type=\"text\" class=\"search-input\" id=\"local-search\" placeholder=\"Search local models...\">\n                    </div>\n                    \n                    <div class=\"filter-bar\">\n                        <div class=\"filter-chip active\" data-filter=\"all\">All</div>\n                        <div class=\"filter-chip\" data-filter=\"ollama\">Ollama</div>\n                        <div class=\"filter-chip\" data-filter=\"lmstudio\">LM Studio</div>\n                        <div class=\"filter-chip\" data-filter=\"installed\">Installed</div>\n                        <div class=\"filter-chip\" data-filter=\"code\">Code</div>\n                        <div class=\"filter-chip\" data-filter=\"chat\">Chat</div>\n                    </div>\n                    \n                    <div class=\"model-grid\" id=\"local-models-grid\">\n                        ".concat(this.generateModelCards(localModels), "\n                    </div>\n                </div>\n                \n                <div class=\"tab-content\" id=\"huggingface-tab\">\n                    <div class=\"search-bar\">\n                        <input type=\"text\" class=\"search-input\" id=\"huggingface-search\" placeholder=\"Search Hugging Face models...\">\n                    </div>\n                    \n                    <div class=\"filter-bar\">\n                        <div class=\"filter-chip active\" data-filter=\"all\">All</div>\n                        <div class=\"filter-chip\" data-filter=\"code\">Code</div>\n                        <div class=\"filter-chip\" data-filter=\"chat\">Chat</div>\n                        <div class=\"filter-chip\" data-filter=\"small\">Small Size</div>\n                    </div>\n                    \n                    <div class=\"model-grid\" id=\"huggingface-models-grid\">\n                        ").concat(this.generateModelCards(huggingfaceModels), "\n                    </div>\n                </div>\n                \n                <div id=\"install-instructions\" class=\"install-instructions\" style=\"display: none;\">\n                    <h3>Installation Instructions</h3>\n                    <div id=\"instructions-content\"></div>\n                </div>\n            </div>\n            \n            <script nonce=\"").concat(nonce, "\">\n                const vscode = acquireVsCodeApi();\n                \n                // Check statuses on load\n                checkOllamaStatus();\n                checkLmStudioStatus();\n                \n                // Set up tab switching\n                document.querySelectorAll('.tab').forEach(tab => {\n                    tab.addEventListener('click', () => {\n                        // Update active tab\n                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));\n                        tab.classList.add('active');\n                        \n                        // Show corresponding content\n                        const tabId = tab.getAttribute('data-tab');\n                        document.querySelectorAll('.tab-content').forEach(content => {\n                            content.classList.remove('active');\n                        });\n                        document.getElementById(tabId + '-tab').classList.add('active');\n                    });\n                });\n                \n                // Setup filter chips\n                document.querySelectorAll('.filter-chip').forEach(chip => {\n                    chip.addEventListener('click', () => {\n                        const parentTab = chip.closest('.tab-content');\n                        parentTab.querySelectorAll('.filter-chip').forEach(c => {\n                            c.classList.remove('active');\n                        });\n                        chip.classList.add('active');\n                        \n                        // Apply filter\n                        const filter = chip.getAttribute('data-filter');\n                        const gridId = parentTab.querySelector('.model-grid').id;\n                        applyFilter(gridId, filter);\n                    });\n                });\n                \n                // Setup search\n                document.getElementById('local-search').addEventListener('input', (e) => {\n                    applySearch('local-models-grid', e.target.value);\n                });\n                document.getElementById('huggingface-search').addEventListener('input', (e) => {\n                    applySearch('huggingface-models-grid', e.target.value);\n                });\n                \n                // Setup buttons\n                document.getElementById('refresh-status').addEventListener('click', () => {\n                    checkOllamaStatus();\n                    checkLmStudioStatus();\n                    vscode.postMessage({ command: 'refreshModels' });\n                });\n                \n                document.getElementById('install-ollama').addEventListener('click', () => {\n                    vscode.postMessage({ command: 'getOllamaInstallInstructions' });\n                });\n                \n                document.getElementById('install-lmstudio').addEventListener('click', () => {\n                    vscode.postMessage({ command: 'getLmStudioInstallInstructions' });\n                });\n                \n                document.getElementById('start-ollama').addEventListener('click', () => {\n                    vscode.postMessage({ command: 'startOllama' });\n                });\n                \n                // Setup model download buttons\n                document.querySelectorAll('.download-button').forEach(button => {\n                    button.addEventListener('click', () => {\n                        const modelId = button.getAttribute('data-model-id');\n                        const provider = button.getAttribute('data-provider');\n                        \n                        if (provider === 'ollama') {\n                            vscode.postMessage({ \n                                command: 'downloadOllamaModel',\n                                modelId: modelId\n                            });\n                        } else if (provider === 'lmstudio') {\n                            vscode.postMessage({ \n                                command: 'downloadLmStudioModel',\n                                modelId: modelId\n                            });\n                        } else if (provider === 'huggingface') {\n                            vscode.postMessage({ \n                                command: 'openHuggingFace',\n                                modelId: modelId\n                            });\n                        }\n                    });\n                });\n                \n                // Setup model select buttons\n                document.querySelectorAll('.select-button').forEach(button => {\n                    button.addEventListener('click', () => {\n                        const modelId = button.getAttribute('data-model-id');\n                        const provider = button.getAttribute('data-provider');\n                        \n                        vscode.postMessage({ \n                            command: 'selectModel',\n                            modelId: modelId,\n                            provider: provider\n                        });\n                    });\n                });\n                \n                function checkOllamaStatus() {\n                    vscode.postMessage({ command: 'checkOllamaStatus' });\n                }\n                \n                function checkLmStudioStatus() {\n                    vscode.postMessage({ command: 'checkLmStudioStatus' });\n                }\n                \n                function applyFilter(gridId, filter) {\n                    const cards = document.querySelectorAll('#' + gridId + ' .model-card');\n                    \n                    cards.forEach(card => {\n                        if (filter === 'all') {\n                            card.style.display = 'block';\n                            return;\n                        }\n                        \n                        if (filter === 'installed' && card.classList.contains('installed')) {\n                            card.style.display = 'block';\n                            return;\n                        }\n                        \n                        if (filter === 'ollama' && card.getAttribute('data-provider') === 'ollama') {\n                            card.style.display = 'block';\n                            return;\n                        }\n                        \n                        if (filter === 'lmstudio' && card.getAttribute('data-provider') === 'lmstudio') {\n                            card.style.display = 'block';\n                            return;\n                        }\n                        \n                        // Tag filters\n                        const tags = card.getAttribute('data-tags').split(',');\n                        if (tags.includes(filter)) {\n                            card.style.display = 'block';\n                            return;\n                        }\n                        \n                        card.style.display = 'none';\n                    });\n                }\n                \n                function applySearch(gridId, query) {\n                    const cards = document.querySelectorAll('#' + gridId + ' .model-card');\n                    const lowerQuery = query.toLowerCase();\n                    \n                    cards.forEach(card => {\n                        const name = card.querySelector('.model-name').innerText.toLowerCase();\n                        const description = card.querySelector('.model-description').innerText.toLowerCase();\n                        const tags = card.getAttribute('data-tags').toLowerCase();\n                        \n                        if (name.includes(lowerQuery) || description.includes(lowerQuery) || tags.includes(lowerQuery)) {\n                            card.style.display = 'block';\n                        } else {\n                            card.style.display = 'none';\n                        }\n                    });\n                }\n                \n                // Handle messages from the extension\n                window.addEventListener('message', event => {\n                    const message = event.data;\n                    \n                    switch (message.command) {\n                        case 'updateOllamaStatus':\n                            updateOllamaStatus(message.installed, message.running);\n                            break;\n                            \n                        case 'updateLmStudioStatus':\n                            updateLmStudioStatus(message.installed);\n                            break;\n                            \n                        case 'showInstallInstructions':\n                            showInstallInstructions(message.content);\n                            break;\n                    }\n                });\n                \n                function updateOllamaStatus(installed, running) {\n                    const statusDot = document.getElementById('ollama-status-dot');\n                    const statusText = document.getElementById('ollama-status').querySelector('span');\n                    const startButton = document.getElementById('start-ollama');\n                    \n                    if (!installed) {\n                        statusDot.className = 'status-dot not-installed';\n                        statusText.textContent = 'Ollama: Not Installed';\n                        startButton.disabled = true;\n                    } else if (running) {\n                        statusDot.className = 'status-dot running';\n                        statusText.textContent = 'Ollama: Running';\n                        startButton.disabled = true;\n                    } else {\n                        statusDot.className = 'status-dot stopped';\n                        statusText.textContent = 'Ollama: Stopped';\n                        startButton.disabled = false;\n                    }\n                }\n                \n                function updateLmStudioStatus(installed) {\n                    const statusDot = document.getElementById('lmstudio-status-dot');\n                    const statusText = document.getElementById('lmstudio-status').querySelector('span');\n                    \n                    if (installed) {\n                        statusDot.className = 'status-dot running';\n                        statusText.textContent = 'LM Studio: Installed';\n                    } else {\n                        statusDot.className = 'status-dot not-installed';\n                        statusText.textContent = 'LM Studio: Not Installed';\n                    }\n                }\n                \n                function showInstallInstructions(content) {\n                    const instructionsDiv = document.getElementById('install-instructions');\n                    const contentDiv = document.getElementById('instructions-content');\n                    \n                    contentDiv.innerHTML = content;\n                    instructionsDiv.style.display = 'block';\n                    \n                    // Scroll to instructions\n                    instructionsDiv.scrollIntoView({ behavior: 'smooth' });\n                }\n            </script>\n        </body>\n        </html>");
    };
    /**
     * Generate HTML for model cards
     */
    LLMSelectionView.prototype.generateModelCards = function (models) {
        var _this = this;
        return models.map(function (model) {
            var _a;
            var tagsHtml = model.tags ? model.tags.map(function (tag) { return "<div class=\"model-tag\">".concat(tag, "</div>"); }).join('') : '';
            return "<div class=\"model-card ".concat(model.installed ? 'installed' : '', "\" data-provider=\"").concat(model.provider, "\" data-tags=\"").concat(((_a = model.tags) === null || _a === void 0 ? void 0 : _a.join(',')) || '', "\">\n                ").concat(model.installed ? '<div class="installed-tag">Installed</div>' : '', "\n                <div class=\"model-name\">").concat(model.name, "</div>\n                <div class=\"model-provider\">").concat(_this.formatProviderName(model.provider), "</div>\n                <div class=\"model-description\">").concat(model.description, "</div>\n                <div class=\"model-meta\">\n                    <div>Size: ").concat(model.size || 'Unknown', "</div>\n                    <div>").concat(model.license || '', "</div>\n                </div>\n                <div class=\"model-tags\">\n                    ").concat(tagsHtml, "\n                </div>\n                <div class=\"model-actions\">\n                    ").concat(model.installed
                ? "<button class=\"action-button select-button\" data-model-id=\"".concat(model.id, "\" data-provider=\"").concat(model.provider, "\">Select</button>")
                : "<button class=\"action-button download-button\" data-model-id=\"".concat(model.id, "\" data-provider=\"").concat(model.provider, "\">Download</button>"), "\n                </div>\n            </div>");
        }).join('');
    };
    /**
     * Format provider name for display
     */
    LLMSelectionView.prototype.formatProviderName = function (provider) {
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
    };
    /**
     * Handle messages from the webview
     */
    LLMSelectionView.prototype.handleWebviewMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var ollamaStatus, lmStudioStatus, ollamaInstructions, lmStudioInstructions, _a, error_1, errorMessage, error_2, errorMessage, provider, modelId;
            var _b, _c, _d, _e;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        _a = message.command;
                        switch (_a) {
                            case 'checkOllamaStatus': return [3 /*break*/, 1];
                            case 'checkLmStudioStatus': return [3 /*break*/, 3];
                            case 'refreshModels': return [3 /*break*/, 5];
                            case 'getOllamaInstallInstructions': return [3 /*break*/, 7];
                            case 'getLmStudioInstallInstructions': return [3 /*break*/, 8];
                            case 'startOllama': return [3 /*break*/, 9];
                            case 'downloadOllamaModel': return [3 /*break*/, 10];
                            case 'downloadLmStudioModel': return [3 /*break*/, 14];
                            case 'openHuggingFace': return [3 /*break*/, 18];
                            case 'selectModel': return [3 /*break*/, 19];
                        }
                        return [3 /*break*/, 22];
                    case 1: return [4 /*yield*/, this.modelsManager.checkOllamaStatus()];
                    case 2:
                        ollamaStatus = _f.sent();
                        (_b = this.panel) === null || _b === void 0 ? void 0 : _b.webview.postMessage({
                            command: 'updateOllamaStatus',
                            installed: ollamaStatus.installed,
                            running: ollamaStatus.running
                        });
                        return [3 /*break*/, 22];
                    case 3: return [4 /*yield*/, this.modelsManager.checkLmStudioStatus()];
                    case 4:
                        lmStudioStatus = _f.sent();
                        (_c = this.panel) === null || _c === void 0 ? void 0 : _c.webview.postMessage({
                            command: 'updateLmStudioStatus',
                            installed: lmStudioStatus.installed
                        });
                        return [3 /*break*/, 22];
                    case 5: return [4 /*yield*/, this.modelsManager.refreshInstalledModels()];
                    case 6:
                        _f.sent();
                        return [3 /*break*/, 22];
                    case 7:
                        ollamaInstructions = this.modelsManager.getOllamaInstallInstructions();
                        (_d = this.panel) === null || _d === void 0 ? void 0 : _d.webview.postMessage({
                            command: 'showInstallInstructions',
                            content: "<p>To install Ollama:</p><pre>".concat(ollamaInstructions, "</pre><p>After installing, restart this extension to use Ollama.</p>")
                        });
                        return [3 /*break*/, 22];
                    case 8:
                        lmStudioInstructions = this.modelsManager.getLmStudioInstallInstructions();
                        (_e = this.panel) === null || _e === void 0 ? void 0 : _e.webview.postMessage({
                            command: 'showInstallInstructions',
                            content: "<p>To install LM Studio:</p><pre>".concat(lmStudioInstructions, "</pre><p>After installing, restart this extension to use LM Studio.</p>")
                        });
                        return [3 /*break*/, 22];
                    case 9:
                        vscode.window.showInformationMessage('Please start Ollama manually. It should be in your applications or you can run "ollama serve" in a terminal.');
                        return [3 /*break*/, 22];
                    case 10:
                        _f.trys.push([10, 12, , 13]);
                        return [4 /*yield*/, this.modelsManager.downloadOllamaModel(message.modelId)];
                    case 11:
                        _f.sent();
                        return [3 /*break*/, 13];
                    case 12:
                        error_1 = _f.sent();
                        errorMessage = error_1 instanceof Error ? error_1.message : String(error_1);
                        vscode.window.showErrorMessage("Failed to download model: ".concat(errorMessage));
                        return [3 /*break*/, 13];
                    case 13: return [3 /*break*/, 22];
                    case 14:
                        _f.trys.push([14, 16, , 17]);
                        return [4 /*yield*/, this.modelsManager.downloadLmStudioModel(message.modelId)];
                    case 15:
                        _f.sent();
                        return [3 /*break*/, 17];
                    case 16:
                        error_2 = _f.sent();
                        errorMessage = error_2 instanceof Error ? error_2.message : String(error_2);
                        vscode.window.showErrorMessage("Failed to download model: ".concat(errorMessage));
                        return [3 /*break*/, 17];
                    case 17: return [3 /*break*/, 22];
                    case 18:
                        vscode.env.openExternal(vscode.Uri.parse("https://huggingface.co/".concat(message.modelId)));
                        return [3 /*break*/, 22];
                    case 19:
                        provider = message.provider;
                        modelId = message.modelId;
                        return [4 /*yield*/, vscode.workspace.getConfiguration('localLLM').update('provider', provider, vscode.ConfigurationTarget.Global)];
                    case 20:
                        _f.sent();
                        return [4 /*yield*/, vscode.workspace.getConfiguration('localLLM').update('modelId', modelId, vscode.ConfigurationTarget.Global)];
                    case 21:
                        _f.sent();
                        vscode.window.showInformationMessage("Selected model \"".concat(modelId, "\" with provider \"").concat(provider, "\""));
                        return [3 /*break*/, 22];
                    case 22: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate a nonce for content security policy
     */
    LLMSelectionView.prototype.getNonce = function () {
        var text = '';
        var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (var i = 0; i < 32; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    };
    return LLMSelectionView;
}());
exports.LLMSelectionView = LLMSelectionView;
