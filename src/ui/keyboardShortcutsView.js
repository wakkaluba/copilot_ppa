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
exports.KeyboardShortcutsViewProvider = void 0;
var vscode = require("vscode");
var keybindingManager_1 = require("../services/ui/keybindingManager");
/**
 * WebviewViewProvider for displaying keyboard shortcuts in the sidebar
 */
var KeyboardShortcutsViewProvider = /** @class */ (function () {
    function KeyboardShortcutsViewProvider(_extensionUri) {
        this._extensionUri = _extensionUri;
    }
    /**
     * Set up the webview HTML and message handlers
     */
    KeyboardShortcutsViewProvider.prototype.resolveWebviewView = function (webviewView, _context, _token) {
        var _this = this;
        this._view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };
        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
        // Handle messages from the webview
        webviewView.webview.onDidReceiveMessage(function (data) {
            switch (data.command) {
                case 'getKeybindings':
                    _this._loadKeybindings();
                    break;
                case 'openSettings':
                    vscode.commands.executeCommand('copilotPPA.openUISettingsPanel', 'keybindings');
                    break;
                case 'editKeybinding':
                    _this._editKeybinding(data.id);
                    break;
            }
        });
        // Initial load
        this._loadKeybindings();
    };
    /**
     * Load and display keybindings in the webview
     */
    KeyboardShortcutsViewProvider.prototype._loadKeybindings = function () {
        if (!this._view) {
            return;
        }
        var keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
        var keybindings = keybindingManager.getKeybindings();
        this._view.webview.postMessage({
            command: 'keybindingsLoaded',
            keybindings: keybindings
        });
    };
    /**
     * Handle editing a keybinding
     */
    KeyboardShortcutsViewProvider.prototype._editKeybinding = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var keybindingManager, keybinding, newKey;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        keybindingManager = (0, keybindingManager_1.getKeybindingManager)();
                        keybinding = keybindingManager.getKeybinding(id);
                        if (!keybinding) {
                            return [2 /*return*/];
                        }
                        return [4 /*yield*/, vscode.window.showInputBox({
                                prompt: "Enter new keybinding for \"".concat(keybinding.description, "\""),
                                value: keybinding.key,
                                placeHolder: 'e.g., Ctrl+Shift+P'
                            })];
                    case 1:
                        newKey = _a.sent();
                        if (newKey && newKey !== keybinding.key) {
                            keybindingManager.updateKeybinding(id, newKey);
                            vscode.window.showInformationMessage("Keybinding updated for ".concat(keybinding.description));
                            this._loadKeybindings();
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generate the webview HTML
     */
    KeyboardShortcutsViewProvider.prototype._getHtmlForWebview = function (_webview) {
        return "<!DOCTYPE html>\n        <html lang=\"en\">\n        <head>\n            <meta charset=\"UTF-8\">\n            <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n            <title>Keyboard Shortcuts</title>\n            <style>\n                body {\n                    font-family: var(--vscode-font-family);\n                    padding: 10px;\n                    color: var(--vscode-foreground);\n                }\n                .header {\n                    display: flex;\n                    justify-content: space-between;\n                    align-items: center;\n                    margin-bottom: 15px;\n                }\n                .title {\n                    font-size: 16px;\n                    font-weight: bold;\n                }\n                .settings-btn {\n                    background: var(--vscode-button-background);\n                    color: var(--vscode-button-foreground);\n                    border: none;\n                    padding: 4px 8px;\n                    border-radius: 2px;\n                    cursor: pointer;\n                }\n                .settings-btn:hover {\n                    background: var(--vscode-button-hoverBackground);\n                }\n                .keybinding-list {\n                    width: 100%;\n                }\n                .keybinding-item {\n                    margin-bottom: 12px;\n                    padding-bottom: 12px;\n                    border-bottom: 1px solid var(--vscode-panel-border);\n                    display: flex;\n                    justify-content: space-between;\n                    align-items: center;\n                }\n                .keybinding-item:last-child {\n                    border-bottom: none;\n                }\n                .keybinding-info {\n                    flex: 1;\n                }\n                .keybinding-desc {\n                    margin-bottom: 5px;\n                    font-weight: 500;\n                }\n                .keybinding-when {\n                    font-size: 12px;\n                    color: var(--vscode-descriptionForeground);\n                    margin-top: 2px;\n                }\n                .keybinding-key {\n                    display: inline-flex;\n                    background: var(--vscode-badge-background);\n                    color: var(--vscode-badge-foreground);\n                    padding: 2px 6px;\n                    border-radius: 3px;\n                    font-family: monospace;\n                    margin-right: 5px;\n                    align-items: center;\n                }\n                .keybinding-edit {\n                    margin-left: 10px;\n                    color: var(--vscode-textLink-foreground);\n                    text-decoration: none;\n                    cursor: pointer;\n                    font-size: 12px;\n                    opacity: 0;\n                    transition: opacity 0.2s;\n                }\n                .keybinding-item:hover .keybinding-edit {\n                    opacity: 1;\n                }\n                .keybinding-edit:hover {\n                    text-decoration: underline;\n                }\n                .category {\n                    margin-top: 20px;\n                    margin-bottom: 10px;\n                    font-weight: bold;\n                    color: var(--vscode-descriptionForeground);\n                    border-bottom: 1px solid var(--vscode-panel-border);\n                    padding-bottom: 5px;\n                }\n            </style>\n        </head>\n        <body>\n            <div class=\"header\">\n                <div class=\"title\">Keyboard Shortcuts</div>\n                <button class=\"settings-btn\" id=\"settingsBtn\">Customize</button>\n            </div>\n\n            <div id=\"keybindingList\">\n                <div style=\"text-align: center;\">Loading...</div>\n            </div>\n\n            <script>\n                (function() {\n                    const vscode = acquireVsCodeApi();\n                    const keybindingList = document.getElementById('keybindingList');\n                    const settingsBtn = document.getElementById('settingsBtn');\n\n                    // Request keybindings\n                    vscode.postMessage({ command: 'getKeybindings' });\n\n                    // Handle settings button\n                    settingsBtn.addEventListener('click', () => {\n                        vscode.postMessage({ command: 'openSettings' });\n                    });\n\n                    // Handle messages from extension\n                    window.addEventListener('message', event => {\n                        const message = event.data;\n\n                        switch (message.command) {\n                            case 'keybindingsLoaded':\n                                renderKeybindings(message.keybindings);\n                                break;\n                        }\n                    });\n\n                    // Render keybindings grouped by category\n                    function renderKeybindings(keybindings) {\n                        keybindingList.innerHTML = '';\n\n                        // Use the categories from KeybindingCategory enum\n                        const categories = {\n                            [KeybindingCategory.Chat]: [],\n                            [KeybindingCategory.Code]: [],\n                            [KeybindingCategory.Navigation]: [],\n                            [KeybindingCategory.Other]: []\n                        };\n\n                        // Group by category\n                        keybindings.forEach(binding => {\n                            categories[binding.category].push(binding);\n                        });\n\n                        // Remove empty categories and render\n                        Object.entries(categories)\n                            .filter(([_, bindings]) => bindings.length > 0)\n                            .forEach(([category, bindings]) => {\n                                const categoryEl = document.createElement('div');\n                                categoryEl.className = 'category';\n                                categoryEl.textContent = category;\n                                keybindingList.appendChild(categoryEl);\n\n                                bindings.forEach(binding => {\n                                    const item = document.createElement('div');\n                                    item.className = 'keybinding-item';\n\n                                    const info = document.createElement('div');\n                                    info.className = 'keybinding-info';\n\n                                    const desc = document.createElement('div');\n                                    desc.className = 'keybinding-desc';\n                                    desc.textContent = binding.description;\n                                    info.appendChild(desc);\n\n                                    if (binding.when) {\n                                        const when = document.createElement('div');\n                                        when.className = 'keybinding-when';\n                                        when.textContent = `When: ${binding.when}`;\n                                        info.appendChild(when);\n                                    }\n\n                                    const controls = document.createElement('div');\n                                    controls.style.display = 'flex';\n                                    controls.style.alignItems = 'center';\n\n                                    const keyEl = document.createElement('span');\n                                    keyEl.className = 'keybinding-key';\n                                    keyEl.textContent = binding.key;\n\n                                    const editLink = document.createElement('a');\n                                    editLink.className = 'keybinding-edit';\n                                    editLink.textContent = 'Edit';\n                                    editLink.addEventListener('click', () => {\n                                        vscode.postMessage({\n                                            command: 'editKeybinding',\n                                            id: binding.id\n                                        });\n                                    });\n\n                                    controls.appendChild(keyEl);\n                                    controls.appendChild(editLink);\n\n                                    item.appendChild(info);\n                                    item.appendChild(controls);\n                                    keybindingList.appendChild(item);\n                                });\n                            });\n                    }\n                })();\n            </script>\n        </body>\n        </html>";
    };
    KeyboardShortcutsViewProvider.viewType = 'copilotPPA.keyboardShortcutsView';
    return KeyboardShortcutsViewProvider;
}());
exports.KeyboardShortcutsViewProvider = KeyboardShortcutsViewProvider;
