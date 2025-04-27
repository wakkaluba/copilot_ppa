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
exports.SnippetsPanelProvider = void 0;
var vscode = require("vscode");
var snippetManager_1 = require("../services/snippetManager");
var SnippetsPanelProvider = /** @class */ (function () {
    function SnippetsPanelProvider(context) {
        this.context = context;
        this.disposables = [];
        this.snippetManager = snippetManager_1.SnippetManager.getInstance(context);
    }
    SnippetsPanelProvider.prototype.dispose = function () {
        var _a;
        (_a = this.panel) === null || _a === void 0 ? void 0 : _a.dispose();
        this.disposables.forEach(function (d) { return d.dispose(); });
        this.disposables = [];
    };
    SnippetsPanelProvider.prototype.open = function () {
        var _this = this;
        if (this.panel) {
            this.panel.reveal();
            return;
        }
        this.panel = vscode.window.createWebviewPanel(SnippetsPanelProvider.viewType, 'Conversation Snippets', vscode.ViewColumn.One, {
            enableScripts: true,
            retainContextWhenHidden: true,
            localResourceRoots: [
                vscode.Uri.joinPath(this.context.extensionUri, 'resources')
            ]
        });
        this.panel.iconPath = vscode.Uri.joinPath(this.context.extensionUri, 'resources', 'icons', 'snippet.svg');
        // Update webview content initially
        this.updateWebviewContent();
        // Listen for snippet changes
        this.disposables.push(this.snippetManager.onSnippetAdded(function () { return _this.updateWebviewContent(); }), this.snippetManager.onSnippetUpdated(function () { return _this.updateWebviewContent(); }), this.snippetManager.onSnippetDeleted(function () { return _this.updateWebviewContent(); }));
        // Handle panel disposal
        this.panel.onDidDispose(function () {
            _this.panel = undefined;
            _this.dispose();
        }, null, this.disposables);
        // Handle messages from the webview
        this.panel.webview.onDidReceiveMessage(function (message) { return __awaiter(_this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.command;
                        switch (_a) {
                            case 'createSnippet': return [3 /*break*/, 1];
                            case 'updateSnippet': return [3 /*break*/, 3];
                            case 'deleteSnippet': return [3 /*break*/, 5];
                            case 'insertSnippet': return [3 /*break*/, 7];
                            case 'copySnippet': return [3 /*break*/, 9];
                            case 'openSource': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.handleCreateSnippet(message.title, message.content, message.tags)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 3: return [4 /*yield*/, this.handleUpdateSnippet(message.id, message.updates)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 5: return [4 /*yield*/, this.handleDeleteSnippet(message.id)];
                    case 6:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 7: return [4 /*yield*/, vscode.commands.executeCommand('copilotPPA.insertSnippet', message.id)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 9: return [4 /*yield*/, this.handleCopySnippet(message.id)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, this.handleOpenSource(message.id)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        }); }, null, this.disposables);
    };
    SnippetsPanelProvider.prototype.updateWebviewContent = function () {
        if (!this.panel) {
            return;
        }
        var snippets = this.snippetManager.getAllSnippets();
        this.panel.webview.html = this.getWebviewContent(snippets);
    };
    SnippetsPanelProvider.prototype.handleCreateSnippet = function (title, content, tags) {
        return __awaiter(this, void 0, void 0, function () {
            var error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.snippetManager.createSnippetFromContent(title, content, tags)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage("Snippet \"".concat(title, "\" created successfully"));
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to create snippet: ".concat(error_1.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SnippetsPanelProvider.prototype.handleUpdateSnippet = function (id, updates) {
        return __awaiter(this, void 0, void 0, function () {
            var updated, error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.snippetManager.updateSnippet(id, updates)];
                    case 1:
                        updated = _a.sent();
                        if (updated) {
                            vscode.window.showInformationMessage("Snippet \"".concat(updated.title, "\" updated successfully"));
                        }
                        else {
                            vscode.window.showErrorMessage('Snippet not found');
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Failed to update snippet: ".concat(error_2.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SnippetsPanelProvider.prototype.handleDeleteSnippet = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var deleted, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.snippetManager.deleteSnippet(id)];
                    case 1:
                        deleted = _a.sent();
                        if (deleted) {
                            vscode.window.showInformationMessage('Snippet deleted successfully');
                        }
                        else {
                            vscode.window.showErrorMessage('Snippet not found');
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Failed to delete snippet: ".concat(error_3.message));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SnippetsPanelProvider.prototype.handleCopySnippet = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var snippet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        snippet = this.snippetManager.getSnippet(id);
                        if (!snippet) return [3 /*break*/, 2];
                        return [4 /*yield*/, vscode.env.clipboard.writeText(snippet.content)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage('Snippet copied to clipboard');
                        return [3 /*break*/, 3];
                    case 2:
                        vscode.window.showErrorMessage('Snippet not found');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SnippetsPanelProvider.prototype.handleOpenSource = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var snippet;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        snippet = this.snippetManager.getSnippet(id);
                        if (!(snippet && snippet.sourceConversationId)) return [3 /*break*/, 2];
                        return [4 /*yield*/, vscode.commands.executeCommand('copilotPPA.openConversation', snippet.sourceConversationId)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        vscode.window.showErrorMessage('Source conversation not found');
                        _a.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    SnippetsPanelProvider.prototype.getWebviewContent = function (snippets) {
        var _this = this;
        // Get all unique tags
        var allTags = new Set();
        snippets.forEach(function (snippet) {
            snippet.tags.forEach(function (tag) { return allTags.add(tag); });
        });
        return "\n        <!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>Conversation Snippets</title>\n            <style>\n                body {\n                    font-family: var(--vscode-font-family);\n                    color: var(--vscode-editor-foreground);\n                    background-color: var(--vscode-editor-background);\n                    padding: 20px;\n                }\n                .snippets-container {\n                    display: flex;\n                    flex-direction: column;\n                    gap: 16px;\n                }\n                .snippet-card {\n                    border: 1px solid var(--vscode-panel-border);\n                    border-radius: 4px;\n                    padding: 12px;\n                    background-color: var(--vscode-editor-background);\n                }\n                .snippet-header {\n                    display: flex;\n                    justify-content: space-between;\n                    align-items: center;\n                    margin-bottom: 8px;\n                }\n                .snippet-title {\n                    font-weight: bold;\n                    font-size: 16px;\n                    margin: 0;\n                }\n                .snippet-actions {\n                    display: flex;\n                    gap: 8px;\n                }\n                .snippet-content {\n                    padding: 8px;\n                    background-color: var(--vscode-textBlockQuote-background);\n                    border-left: 4px solid var(--vscode-textBlockQuote-border);\n                    margin-bottom: 8px;\n                    white-space: pre-wrap;\n                    max-height: 200px;\n                    overflow-y: auto;\n                }\n                .snippet-tags {\n                    display: flex;\n                    flex-wrap: wrap;\n                    gap: 4px;\n                    margin-top: 8px;\n                }\n                .snippet-tag {\n                    background-color: var(--vscode-badge-background);\n                    color: var(--vscode-badge-foreground);\n                    padding: 2px 6px;\n                    border-radius: 4px;\n                    font-size: 12px;\n                }\n                .snippet-meta {\n                    font-size: 12px;\n                    color: var(--vscode-descriptionForeground);\n                    margin-top: 4px;\n                }\n                .create-snippet-form {\n                    border: 1px solid var(--vscode-panel-border);\n                    border-radius: 4px;\n                    padding: 16px;\n                    margin-bottom: 20px;\n                }\n                .form-group {\n                    margin-bottom: 12px;\n                }\n                .form-group label {\n                    display: block;\n                    margin-bottom: 4px;\n                }\n                .form-group input, .form-group textarea {\n                    width: 100%;\n                    padding: 6px;\n                    background-color: var(--vscode-input-background);\n                    color: var(--vscode-input-foreground);\n                    border: 1px solid var(--vscode-input-border);\n                }\n                .form-group textarea {\n                    min-height: 100px;\n                    font-family: var(--vscode-editor-font-family);\n                }\n                button {\n                    background-color: var(--vscode-button-background);\n                    color: var(--vscode-button-foreground);\n                    border: none;\n                    padding: 6px 12px;\n                    cursor: pointer;\n                }\n                button:hover {\n                    background-color: var(--vscode-button-hoverBackground);\n                }\n                .tag-filter {\n                    margin-bottom: 16px;\n                }\n                .action-button {\n                    background-color: transparent;\n                    border: none;\n                    cursor: pointer;\n                    color: var(--vscode-editor-foreground);\n                    padding: 2px 4px;\n                }\n                .action-button:hover {\n                    background-color: var(--vscode-button-hoverBackground);\n                }\n                .empty-state {\n                    text-align: center;\n                    padding: 40px;\n                    color: var(--vscode-descriptionForeground);\n                }\n                .filters {\n                    margin-bottom: 16px;\n                    display: flex;\n                    align-items: center;\n                    gap: 8px;\n                }\n                .filters input {\n                    flex-grow: 1;\n                    padding: 6px;\n                    background-color: var(--vscode-input-background);\n                    color: var(--vscode-input-foreground);\n                    border: 1px solid var(--vscode-input-border);\n                }\n                .tag-pills {\n                    display: flex;\n                    flex-wrap: wrap;\n                    gap: 4px;\n                    margin-bottom: 16px;\n                }\n                .tag-pill {\n                    background-color: var(--vscode-badge-background);\n                    color: var(--vscode-badge-foreground);\n                    padding: 4px 8px;\n                    border-radius: 16px;\n                    font-size: 12px;\n                    cursor: pointer;\n                }\n                .tag-pill.active {\n                    background-color: var(--vscode-button-background);\n                }\n            </style>\n        </head>\n        <body>\n            <h1>Conversation Snippets</h1>\n            \n            <div class=\"create-snippet-form\">\n                <h2>Create New Snippet</h2>\n                <div class=\"form-group\">\n                    <label for=\"snippet-title\">Title</label>\n                    <input type=\"text\" id=\"snippet-title\" placeholder=\"Enter snippet title\">\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"snippet-content\">Content</label>\n                    <textarea id=\"snippet-content\" placeholder=\"Enter snippet content\"></textarea>\n                </div>\n                <div class=\"form-group\">\n                    <label for=\"snippet-tags\">Tags (comma-separated)</label>\n                    <input type=\"text\" id=\"snippet-tags\" placeholder=\"tag1, tag2, tag3\">\n                </div>\n                <button id=\"create-snippet-btn\">Create Snippet</button>\n            </div>\n            \n            <div class=\"filters\">\n                <input type=\"text\" id=\"snippet-search\" placeholder=\"Search snippets...\">\n            </div>\n            \n            <div class=\"tag-pills\">\n                <div class=\"tag-pill active\" data-tag=\"all\">All</div>\n                ".concat(Array.from(allTags).map(function (tag) {
            return "<div class=\"tag-pill\" data-tag=\"".concat(tag, "\">").concat(tag, "</div>");
        }).join(''), "\n            </div>\n            \n            <div class=\"snippets-container\">\n                ").concat(snippets.length === 0 ?
            "<div class=\"empty-state\">\n                        <p>No snippets created yet.</p>\n                        <p>Create your first snippet using the form above or by selecting messages in a conversation.</p>\n                    </div>" :
            snippets.map(function (snippet) { return _this.renderSnippetCard(snippet); }).join(''), "\n            </div>\n            \n            <script>\n                const vscode = acquireVsCodeApi();\n                \n                // Store snippets for filtering\n                const snippets = ").concat(JSON.stringify(snippets), ";\n                \n                document.addEventListener('DOMContentLoaded', () => {\n                    setupEventListeners();\n                });\n                \n                function setupEventListeners() {\n                    // Create snippet button\n                    document.getElementById('create-snippet-btn').addEventListener('click', () => {\n                        const title = document.getElementById('snippet-title').value.trim();\n                        const content = document.getElementById('snippet-content').value.trim();\n                        const tagsInput = document.getElementById('snippet-tags').value.trim();\n                        \n                        if (!title) {\n                            alert('Please enter a title for the snippet');\n                            return;\n                        }\n                        \n                        if (!content) {\n                            alert('Please enter content for the snippet');\n                            return;\n                        }\n                        \n                        const tags = tagsInput ? tagsInput.split(',').map(tag => tag.trim()).filter(Boolean) : [];\n                        \n                        vscode.postMessage({\n                            command: 'createSnippet',\n                            title,\n                            content,\n                            tags\n                        });\n                        \n                        // Clear form\n                        document.getElementById('snippet-title').value = '';\n                        document.getElementById('snippet-content').value = '';\n                        document.getElementById('snippet-tags').value = '';\n                    });\n                    \n                    // Search input\n                    document.getElementById('snippet-search').addEventListener('input', filterSnippets);\n                    \n                    // Tag filtering\n                    document.querySelectorAll('.tag-pill').forEach(pill => {\n                        pill.addEventListener('click', (e) => {\n                            // Toggle active class\n                            document.querySelectorAll('.tag-pill').forEach(p => p.classList.remove('active'));\n                            e.target.classList.add('active');\n                            \n                            filterSnippets();\n                        });\n                    });\n                    \n                    // Snippet action buttons\n                    document.querySelectorAll('.action-button').forEach(button => {\n                        button.addEventListener('click', (e) => {\n                            const action = e.target.closest('button').dataset.action;\n                            const snippetId = e.target.closest('.snippet-card').dataset.id;\n                            \n                            switch (action) {\n                                case 'copy':\n                                    vscode.postMessage({\n                                        command: 'copySnippet',\n                                        id: snippetId\n                                    });\n                                    break;\n                                case 'insert':\n                                    vscode.postMessage({\n                                        command: 'insertSnippet',\n                                        id: snippetId\n                                    });\n                                    break;\n                                case 'delete':\n                                    if (confirm('Are you sure you want to delete this snippet?')) {\n                                        vscode.postMessage({\n                                            command: 'deleteSnippet',\n                                            id: snippetId\n                                        });\n                                    }\n                                    break;\n                                case 'source':\n                                    vscode.postMessage({\n                                        command: 'openSource',\n                                        id: snippetId\n                                    });\n                                    break;\n                            }\n                        });\n                    });\n                }\n                \n                function filterSnippets() {\n                    const searchQuery = document.getElementById('snippet-search').value.toLowerCase();\n                    const activeTag = document.querySelector('.tag-pill.active').dataset.tag;\n                    \n                    const filteredSnippets = snippets.filter(snippet => {\n                        // Filter by search query\n                        const matchesSearch = \n                            searchQuery === '' || \n                            snippet.title.toLowerCase().includes(searchQuery) ||\n                            snippet.content.toLowerCase().includes(searchQuery);\n                        \n                        // Filter by tag\n                        const matchesTag = \n                            activeTag === 'all' || \n                            snippet.tags.includes(activeTag);\n                        \n                        return matchesSearch && matchesTag;\n                    });\n                    \n                    // Update UI\n                    const container = document.querySelector('.snippets-container');\n                    if (filteredSnippets.length === 0) {\n                        container.innerHTML = `\n                            <div class=\"empty-state\">\n                                <p>No snippets match your search.</p>\n                            </div>\n                        `;\n                    } else {\n                        container.innerHTML = filteredSnippets.map(snippet => {\n                            // This is a simplified version - in reality, you'd want to use a template function\n                            return `\n                                <div class=\"snippet-card\" data-id=\"${snippet.id}\">\n                                    <div class=\"snippet-header\">\n                                        <h3 class=\"snippet-title\">${snippet.title}</h3>\n                                        <div class=\"snippet-actions\">\n                                            <button class=\"action-button\" data-action=\"copy\" title=\"Copy to Clipboard\">\uD83D\uDCCB</button>\n                                            <button class=\"action-button\" data-action=\"insert\" title=\"Insert into Editor\">\uD83D\uDCDD</button>\n                                            <button class=\"action-button\" data-action=\"delete\" title=\"Delete Snippet\">\uD83D\uDDD1\uFE0F</button>\n                                            ${snippet.sourceConversationId ? \n                                                `<button class=\"action-button\" data-action=\"source\" title=\"Open Source Conversation\">\uD83D\uDD0D</button>` : ''}\n                                        </div>\n                                    </div>\n                                    <div class=\"snippet-content\">${snippet.content}</div>\n                                    <div class=\"snippet-tags\">\n                                        ${snippet.tags.map(tag => `<span class=\"snippet-tag\">${tag}</span>`).join('')}\n                                    </div>\n                                    <div class=\"snippet-meta\">\n                                        Created: ${new Date(snippet.createdAt).toLocaleString()}\n                                    </div>\n                                </div>\n                            `;\n                        }).join('');\n                        \n                        // Reattach event listeners to new elements\n                        document.querySelectorAll('.action-button').forEach(button => {\n                            button.addEventListener('click', (e) => {\n                                const action = e.target.closest('button').dataset.action;\n                                const snippetId = e.target.closest('.snippet-card').dataset.id;\n                                \n                                switch (action) {\n                                    case 'copy':\n                                        vscode.postMessage({\n                                            command: 'copySnippet',\n                                            id: snippetId\n                                        });\n                                        break;\n                                    case 'insert':\n                                        vscode.postMessage({\n                                            command: 'insertSnippet',\n                                            id: snippetId\n                                        });\n                                        break;\n                                    case 'delete':\n                                        if (confirm('Are you sure you want to delete this snippet?')) {\n                                            vscode.postMessage({\n                                                command: 'deleteSnippet',\n                                                id: snippetId\n                                            });\n                                        }\n                                        break;\n                                    case 'source':\n                                        vscode.postMessage({\n                                            command: 'openSource',\n                                            id: snippetId\n                                        });\n                                        break;\n                                }\n                            });\n                        });\n                    }\n                }\n            </script>\n        </body>\n        </html>\n        ");
    };
    SnippetsPanelProvider.prototype.renderSnippetCard = function (snippet) {
        return "\n        <div class=\"snippet-card\" data-id=\"".concat(snippet.id, "\">\n            <div class=\"snippet-header\">\n                <h3 class=\"snippet-title\">").concat(snippet.title, "</h3>\n                <div class=\"snippet-actions\">\n                    <button class=\"action-button\" data-action=\"copy\" title=\"Copy to Clipboard\">\uD83D\uDCCB</button>\n                    <button class=\"action-button\" data-action=\"insert\" title=\"Insert into Editor\">\uD83D\uDCDD</button>\n                    <button class=\"action-button\" data-action=\"delete\" title=\"Delete Snippet\">\uD83D\uDDD1\uFE0F</button>\n                    ").concat(snippet.sourceConversationId ?
            "<button class=\"action-button\" data-action=\"source\" title=\"Open Source Conversation\">\uD83D\uDD0D</button>" : '', "\n                </div>\n            </div>\n            <div class=\"snippet-content\">").concat(this.escapeHtml(snippet.content), "</div>\n            <div class=\"snippet-tags\">\n                ").concat(snippet.tags.map(function (tag) { return "<span class=\"snippet-tag\">".concat(tag, "</span>"); }).join(''), "\n            </div>\n            <div class=\"snippet-meta\">\n                Created: ").concat(new Date(snippet.createdAt).toLocaleString(), "\n            </div>\n        </div>\n        ");
    };
    SnippetsPanelProvider.prototype.escapeHtml = function (unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    };
    SnippetsPanelProvider.viewType = 'copilotPPA.snippetsPanel';
    return SnippetsPanelProvider;
}());
exports.SnippetsPanelProvider = SnippetsPanelProvider;
