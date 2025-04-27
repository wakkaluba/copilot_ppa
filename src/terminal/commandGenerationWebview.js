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
exports.CommandGenerationWebview = void 0;
var vscode = require("vscode");
var types_1 = require("./types");
/**
 * Webview panel for enhanced terminal command generation
 */
var CommandGenerationWebview = /** @class */ (function () {
    function CommandGenerationWebview(context, aiHelper, interactiveShell) {
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
    CommandGenerationWebview.prototype.show = function () {
        return __awaiter(this, arguments, void 0, function (initialPrompt, shellType) {
            var _this = this;
            if (initialPrompt === void 0) { initialPrompt = ''; }
            if (shellType === void 0) { shellType = types_1.TerminalShellType.VSCodeDefault; }
            return __generator(this, function (_a) {
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
                    this.panel.onDidDispose(function () {
                        _this.panel = undefined;
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
                return [2 /*return*/];
            });
        });
    };
    /**
     * Generates HTML content for the webview
     * @param shellType Current shell type
     * @param initialPrompt Initial prompt if any
     * @returns HTML content for the webview
     */
    CommandGenerationWebview.prototype.getWebviewContent = function (shellType, initialPrompt) {
        if (initialPrompt === void 0) { initialPrompt = ''; }
        return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n    <meta charset=\"UTF-8\">\n    <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n    <title>Terminal Command Generator</title>\n    <style>\n        body {\n            font-family: var(--vscode-font-family);\n            padding: 20px;\n            color: var(--vscode-foreground);\n            background-color: var(--vscode-editor-background);\n        }\n        .container {\n            display: flex;\n            flex-direction: column;\n            gap: 20px;\n        }\n        .input-section {\n            display: flex;\n            flex-direction: column;\n            gap: 10px;\n        }\n        .shell-selector {\n            display: flex;\n            gap: 10px;\n            margin-bottom: 10px;\n        }\n        textarea, input {\n            background-color: var(--vscode-input-background);\n            color: var(--vscode-input-foreground);\n            border: 1px solid var(--vscode-input-border);\n            padding: 8px;\n            font-family: var(--vscode-editor-font-family);\n            font-size: var(--vscode-editor-font-size);\n        }\n        textarea {\n            min-height: 100px;\n            resize: vertical;\n        }\n        button {\n            background-color: var(--vscode-button-background);\n            color: var(--vscode-button-foreground);\n            border: none;\n            padding: 8px 16px;\n            cursor: pointer;\n            font-weight: bold;\n        }\n        button:hover {\n            background-color: var(--vscode-button-hoverBackground);\n        }\n        .command-section {\n            border: 1px solid var(--vscode-panel-border);\n            border-radius: 4px;\n            padding: 15px;\n            background-color: var(--vscode-editor-inactiveSelectionBackground);\n            overflow: auto;\n        }\n        .command-box {\n            font-family: monospace;\n            background-color: var(--vscode-terminal-background);\n            color: var(--vscode-terminal-foreground);\n            padding: 10px;\n            border-radius: 4px;\n            margin-bottom: 10px;\n            white-space: pre-wrap;\n            word-break: break-all;\n        }\n        .actions {\n            display: flex;\n            gap: 10px;\n            margin-top: 10px;\n        }\n        .details-section {\n            margin-top: 15px;\n        }\n        .details-header {\n            font-weight: bold;\n            margin-bottom: 5px;\n        }\n        .details-content {\n            margin-bottom: 15px;\n            padding-left: 10px;\n        }\n        .hidden {\n            display: none;\n        }\n        .history-item {\n            padding: 5px;\n            cursor: pointer;\n            border-bottom: 1px solid var(--vscode-panel-border);\n        }\n        .history-item:hover {\n            background-color: var(--vscode-list-hoverBackground);\n        }\n        .tab-container {\n            display: flex;\n            border-bottom: 1px solid var(--vscode-panel-border);\n            margin-bottom: 10px;\n        }\n        .tab {\n            padding: 8px 16px;\n            cursor: pointer;\n            border: 1px solid transparent;\n            border-bottom: none;\n            margin-bottom: -1px;\n        }\n        .tab.active {\n            background-color: var(--vscode-editor-background);\n            border-color: var(--vscode-panel-border);\n            border-bottom-color: var(--vscode-editor-background);\n        }\n        .tab-content {\n            display: none;\n        }\n        .tab-content.active {\n            display: block;\n        }\n        .risk {\n            color: var(--vscode-errorForeground);\n        }\n        .alternatives {\n            margin-top: 15px;\n        }\n        .loading {\n            display: flex;\n            align-items: center;\n            justify-content: center;\n            padding: 20px;\n        }\n        .spinner {\n            border: 4px solid rgba(0, 0, 0, 0.1);\n            border-left-color: var(--vscode-progressBar-background);\n            border-radius: 50%;\n            width: 20px;\n            height: 20px;\n            animation: spin 1s linear infinite;\n            margin-right: 10px;\n        }\n        @keyframes spin {\n            0% { transform: rotate(0deg); }\n            100% { transform: rotate(360deg); }\n        }\n    </style>\n</head>\n<body>\n    <div class=\"container\">\n        <h2>Terminal Command Generator</h2>\n        \n        <div class=\"input-section\">\n            <div class=\"shell-selector\">\n                <label>Shell: </label>\n                <select id=\"shellType\">\n                    <option value=\"vscode-default\" ".concat(shellType === 'vscode-default' ? 'selected' : '', ">VS Code Default</option>\n                    <option value=\"powershell\" ").concat(shellType === 'powershell' ? 'selected' : '', ">PowerShell</option>\n                    <option value=\"git-bash\" ").concat(shellType === 'git-bash' ? 'selected' : '', ">Git Bash</option>\n                    <option value=\"wsl-bash\" ").concat(shellType === 'wsl-bash' ? 'selected' : '', ">WSL Bash</option>\n                </select>\n            </div>\n            \n            <label for=\"description\">Describe what you want to do:</label>\n            <textarea id=\"description\" placeholder=\"Enter a description of the command you need...\">").concat(initialPrompt, "</textarea>\n            \n            <div class=\"actions\">\n                <button id=\"generateBtn\">Generate Command</button>\n                <button id=\"clearBtn\">Clear</button>\n                <button id=\"historyBtn\">Show History</button>\n            </div>\n        </div>\n        \n        <div id=\"loadingIndicator\" class=\"loading hidden\">\n            <div class=\"spinner\"></div>\n            <span>Generating command...</span>\n        </div>\n        \n        <div id=\"resultSection\" class=\"command-section hidden\">\n            <div class=\"tab-container\">\n                <div class=\"tab active\" data-tab=\"command\">Command</div>\n                <div class=\"tab\" data-tab=\"explanation\">Explanation</div>\n                <div class=\"tab\" data-tab=\"analysis\">Analysis</div>\n                <div class=\"tab\" data-tab=\"variations\">Variations</div>\n            </div>\n            \n            <div id=\"commandTab\" class=\"tab-content active\">\n                <div class=\"command-box\" id=\"commandOutput\"></div>\n                \n                <div class=\"actions\">\n                    <button id=\"runBtn\">Run Command</button>\n                    <button id=\"copyBtn\">Copy to Clipboard</button>\n                    <button id=\"analyzeBtn\">Analyze</button>\n                    <button id=\"variationsBtn\">Generate Variations</button>\n                </div>\n                \n                <div class=\"details-section\">\n                    <div class=\"details-header\">Warnings:</div>\n                    <div class=\"details-content\" id=\"warningsOutput\"></div>\n                </div>\n            </div>\n            \n            <div id=\"explanationTab\" class=\"tab-content\">\n                <div class=\"details-content\" id=\"explanationOutput\"></div>\n            </div>\n            \n            <div id=\"analysisTab\" class=\"tab-content\">\n                <div id=\"analysisOutput\">\n                    <p>Click \"Analyze\" on the Command tab to see detailed analysis.</p>\n                </div>\n            </div>\n            \n            <div id=\"variationsTab\" class=\"tab-content\">\n                <div id=\"variationsOutput\">\n                    <p>Click \"Generate Variations\" on the Command tab to see different ways to accomplish the same task.</p>\n                </div>\n                <div class=\"hidden\" id=\"variationsPromptSection\">\n                    <input type=\"text\" id=\"variationsPrompt\" placeholder=\"Describe how you want to vary the command...\">\n                    <button id=\"getVariationsBtn\">Get Variations</button>\n                </div>\n            </div>\n        </div>\n        \n        <div id=\"historySection\" class=\"command-section hidden\">\n            <h3>Command History</h3>\n            <div id=\"historyList\"></div>\n            <button id=\"closeHistoryBtn\">Close History</button>\n        </div>\n    </div>\n    \n    <script>\n        (function() {\n            const vscode = acquireVsCodeApi();\n            const description = document.getElementById('description');\n            const shellType = document.getElementById('shellType');\n            const generateBtn = document.getElementById('generateBtn');\n            const clearBtn = document.getElementById('clearBtn');\n            const historyBtn = document.getElementById('historyBtn');\n            const runBtn = document.getElementById('runBtn');\n            const copyBtn = document.getElementById('copyBtn');\n            const analyzeBtn = document.getElementById('analyzeBtn');\n            const variationsBtn = document.getElementById('variationsBtn');\n            const commandOutput = document.getElementById('commandOutput');\n            const warningsOutput = document.getElementById('warningsOutput');\n            const explanationOutput = document.getElementById('explanationOutput');\n            const analysisOutput = document.getElementById('analysisOutput');\n            const variationsOutput = document.getElementById('variationsOutput');\n            const resultSection = document.getElementById('resultSection');\n            const loadingIndicator = document.getElementById('loadingIndicator');\n            const historySection = document.getElementById('historySection');\n            const historyList = document.getElementById('historyList');\n            const closeHistoryBtn = document.getElementById('closeHistoryBtn');\n            const variationsPromptSection = document.getElementById('variationsPromptSection');\n            const variationsPrompt = document.getElementById('variationsPrompt');\n            const getVariationsBtn = document.getElementById('getVariationsBtn');\n            \n            // Tab switching\n            document.querySelectorAll('.tab').forEach(tab => {\n                tab.addEventListener('click', () => {\n                    document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));\n                    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));\n                    \n                    tab.classList.add('active');\n                    document.getElementById(tab.dataset.tab + 'Tab').classList.add('active');\n                });\n            });\n            \n            // Generate command\n            generateBtn.addEventListener('click', () => {\n                const descText = description.value.trim();\n                if (!descText) return;\n                \n                loadingIndicator.classList.remove('hidden');\n                resultSection.classList.add('hidden');\n                \n                vscode.postMessage({\n                    command: 'generate',\n                    description: descText,\n                    shellType: shellType.value\n                });\n            });\n            \n            // Run command\n            runBtn.addEventListener('click', () => {\n                if (!commandOutput.textContent) return;\n                \n                vscode.postMessage({\n                    command: 'run',\n                    terminalCommand: commandOutput.textContent,\n                    shellType: shellType.value\n                });\n            });\n            \n            // Copy command to clipboard\n            copyBtn.addEventListener('click', () => {\n                if (!commandOutput.textContent) return;\n                \n                vscode.postMessage({\n                    command: 'copy',\n                    terminalCommand: commandOutput.textContent\n                });\n            });\n            \n            // Analyze command\n            analyzeBtn.addEventListener('click', () => {\n                if (!commandOutput.textContent) return;\n                \n                analysisOutput.innerHTML = '<div class=\"loading\"><div class=\"spinner\"></div><span>Analyzing command...</span></div>';\n                \n                // Switch to analysis tab\n                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));\n                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));\n                document.querySelector('.tab[data-tab=\"analysis\"]').classList.add('active');\n                document.getElementById('analysisTab').classList.add('active');\n                \n                vscode.postMessage({\n                    command: 'analyze',\n                    terminalCommand: commandOutput.textContent,\n                    shellType: shellType.value\n                });\n            });\n            \n            // Generate variations\n            variationsBtn.addEventListener('click', () => {\n                if (!commandOutput.textContent) return;\n                \n                // Switch to variations tab\n                document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));\n                document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));\n                document.querySelector('.tab[data-tab=\"variations\"]').classList.add('active');\n                document.getElementById('variationsTab').classList.add('active');\n                \n                variationsPromptSection.classList.remove('hidden');\n            });\n            \n            // Get variations with prompt\n            getVariationsBtn.addEventListener('click', () => {\n                if (!commandOutput.textContent || !variationsPrompt.value) return;\n                \n                variationsOutput.innerHTML = '<div class=\"loading\"><div class=\"spinner\"></div><span>Generating variations...</span></div>';\n                \n                vscode.postMessage({\n                    command: 'variations',\n                    terminalCommand: commandOutput.textContent,\n                    description: variationsPrompt.value,\n                    shellType: shellType.value\n                });\n            });\n            \n            // Clear inputs\n            clearBtn.addEventListener('click', () => {\n                description.value = '';\n                commandOutput.textContent = '';\n                warningsOutput.textContent = '';\n                explanationOutput.textContent = '';\n                analysisOutput.innerHTML = '<p>Click \"Analyze\" on the Command tab to see detailed analysis.</p>';\n                variationsOutput.innerHTML = '<p>Click \"Generate Variations\" on the Command tab to see different ways to accomplish the same task.</p>';\n                resultSection.classList.add('hidden');\n            });\n            \n            // Show command history\n            historyBtn.addEventListener('click', () => {\n                vscode.postMessage({\n                    command: 'getHistory',\n                    shellType: shellType.value\n                });\n            });\n            \n            // Close history\n            closeHistoryBtn.addEventListener('click', () => {\n                historySection.classList.add('hidden');\n                if (commandOutput.textContent) {\n                    resultSection.classList.remove('hidden');\n                }\n            });\n            \n            // Handle messages from extension\n            window.addEventListener('message', event => {\n                const message = event.data;\n                \n                switch (message.command) {\n                    case 'generationResult':\n                        loadingIndicator.classList.add('hidden');\n                        resultSection.classList.remove('hidden');\n                        \n                        commandOutput.textContent = message.result.command || '';\n                        warningsOutput.innerHTML = message.result.warnings || 'No warnings.';\n                        explanationOutput.innerHTML = message.result.explanation || '';\n                        \n                        // Switch to command tab\n                        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));\n                        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));\n                        document.querySelector('.tab[data-tab=\"command\"]').classList.add('active');\n                        document.getElementById('commandTab').classList.add('active');\n                        \n                        // Show alternatives if available\n                        if (message.result.alternatives && message.result.alternatives.length > 0) {\n                            let alternativesHtml = '<div class=\"details-header\">Alternatives:</div><ul>';\n                            message.result.alternatives.forEach(alt => {\n                                alternativesHtml += `<li>${alt}</li>`;\n                            });\n                            alternativesHtml += '</ul>';\n                            explanationOutput.innerHTML += alternativesHtml;\n                        }\n                        break;\n                        \n                    case 'analysisResult':\n                        let analysisHtml = `\n                            <div class=\"details-header\">Purpose:</div>\n                            <div class=\"details-content\">${message.analysis.purpose}</div>\n                            \n                            <div class=\"details-header\">Components:</div>\n                            <ul>\n                        `;\n                        \n                        message.analysis.components.forEach(component => {\n                            analysisHtml += `<li>${component}</li>`;\n                        });\n                        \n                        analysisHtml += '</ul><div class=\"details-header\">Risks:</div><ul class=\"risk\">';\n                        \n                        message.analysis.risks.forEach(risk => {\n                            analysisHtml += `<li>${risk}</li>`;\n                        });\n                        \n                        analysisHtml += `\n                            </ul>\n                            \n                            <div class=\"details-header\">Performance Considerations:</div>\n                            <div class=\"details-content\">${message.analysis.performance}</div>\n                            \n                            <div class=\"details-header\">Alternatives:</div>\n                            <ul class=\"alternatives\">\n                        `;\n                        \n                        message.analysis.alternatives.forEach(alternative => {\n                            analysisHtml += `<li>${alternative}</li>`;\n                        });\n                        \n                        analysisHtml += '</ul>';\n                        analysisOutput.innerHTML = analysisHtml;\n                        break;\n                        \n                    case 'variationsResult':\n                        let variationsHtml = '<div class=\"details-header\">Command Variations:</div><ul>';\n                        \n                        message.variations.forEach(variation => {\n                            variationsHtml += `\n                                <li>\n                                    <div class=\"command-box\">${variation}</div>\n                                    <button class=\"run-variation\" data-command=\"${variation}\">Run</button>\n                                    <button class=\"copy-variation\" data-command=\"${variation}\">Copy</button>\n                                </li>\n                            `;\n                        });\n                        \n                        variationsHtml += '</ul>';\n                        variationsOutput.innerHTML = variationsHtml;\n                        \n                        // Add event listeners to variation buttons\n                        document.querySelectorAll('.run-variation').forEach(btn => {\n                            btn.addEventListener('click', () => {\n                                vscode.postMessage({\n                                    command: 'run',\n                                    terminalCommand: btn.dataset.command,\n                                    shellType: shellType.value\n                                });\n                            });\n                        });\n                        \n                        document.querySelectorAll('.copy-variation').forEach(btn => {\n                            btn.addEventListener('click', () => {\n                                vscode.postMessage({\n                                    command: 'copy',\n                                    terminalCommand: btn.dataset.command\n                                });\n                            });\n                        });\n                        break;\n                        \n                    case 'historyResult':\n                        historySection.classList.remove('hidden');\n                        resultSection.classList.add('hidden');\n                        \n                        if (message.history.length === 0) {\n                            historyList.innerHTML = '<p>No command history available.</p>';\n                        } else {\n                            let historyHtml = '';\n                            message.history.forEach(entry => {\n                                const status = entry.result?.success ? '\u2713' : '\u2717';\n                                historyHtml += `\n                                    <div class=\"history-item\" data-command=\"${entry.command}\">\n                                        <span>${status}</span> <strong>${entry.command}</strong>\n                                        <div>${new Date(entry.timestamp).toLocaleString()}</div>\n                                    </div>\n                                `;\n                            });\n                            historyList.innerHTML = historyHtml;\n                            \n                            // Add event listeners to history items\n                            document.querySelectorAll('.history-item').forEach(item => {\n                                item.addEventListener('click', () => {\n                                    commandOutput.textContent = item.dataset.command;\n                                    historySection.classList.add('hidden');\n                                    resultSection.classList.remove('hidden');\n                                });\n                            });\n                        }\n                        break;\n                        \n                    case 'notification':\n                        // You could implement a notification system here\n                        break;\n                }\n            });\n            \n            // Initial setup if there's a description\n            if (description.value.trim()) {\n                generateBtn.click();\n            }\n        })();\n    </script>\n</body>\n</html>");
    };
    /**
     * Handles messages from the webview
     * @param message Message from the webview
     */
    CommandGenerationWebview.prototype.handleMessage = function (message) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = message.command;
                        switch (_a) {
                            case 'generate': return [3 /*break*/, 1];
                            case 'run': return [3 /*break*/, 3];
                            case 'copy': return [3 /*break*/, 5];
                            case 'analyze': return [3 /*break*/, 7];
                            case 'variations': return [3 /*break*/, 9];
                            case 'getHistory': return [3 /*break*/, 11];
                        }
                        return [3 /*break*/, 13];
                    case 1: return [4 /*yield*/, this.generateCommand(message.description)];
                    case 2:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 3: return [4 /*yield*/, this.runCommand(message.terminalCommand)];
                    case 4:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 5: return [4 /*yield*/, vscode.env.clipboard.writeText(message.terminalCommand)];
                    case 6:
                        _b.sent();
                        vscode.window.showInformationMessage('Command copied to clipboard');
                        return [3 /*break*/, 13];
                    case 7: return [4 /*yield*/, this.analyzeCommand(message.terminalCommand)];
                    case 8:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 9: return [4 /*yield*/, this.generateVariations(message.terminalCommand, message.description)];
                    case 10:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 11: return [4 /*yield*/, this.getCommandHistory(message.shellType)];
                    case 12:
                        _b.sent();
                        return [3 /*break*/, 13];
                    case 13: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates a command from natural language
     * @param description Natural language description
     */
    CommandGenerationWebview.prototype.generateCommand = function (description) {
        return __awaiter(this, void 0, void 0, function () {
            var result, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.aiHelper.generateCommandFromDescription(description, this.shellType, true)];
                    case 1:
                        result = _a.sent();
                        this.currentCommand = result.command;
                        // Send result to webview
                        if (this.panel) {
                            this.panel.webview.postMessage({
                                command: 'generationResult',
                                result: result
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_1 = _a.sent();
                        vscode.window.showErrorMessage("Failed to generate command: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)));
                        // Send error to webview
                        if (this.panel) {
                            this.panel.webview.postMessage({
                                command: 'generationResult',
                                result: {
                                    command: '',
                                    explanation: '',
                                    warnings: "Error: ".concat(error_1 instanceof Error ? error_1.message : String(error_1)),
                                    alternatives: [],
                                    isValid: false
                                }
                            });
                        }
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Runs a command in a terminal
     * @param terminalCommand Command to run
     */
    CommandGenerationWebview.prototype.runCommand = function (terminalCommand) {
        return __awaiter(this, void 0, void 0, function () {
            var error_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.interactiveShell.executeCommand(terminalCommand, this.shellType)];
                    case 1:
                        _a.sent();
                        vscode.window.showInformationMessage('Command executed successfully');
                        return [3 /*break*/, 3];
                    case 2:
                        error_2 = _a.sent();
                        vscode.window.showErrorMessage("Failed to execute command: ".concat(error_2 instanceof Error ? error_2.message : String(error_2)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Analyzes a command
     * @param terminalCommand Command to analyze
     */
    CommandGenerationWebview.prototype.analyzeCommand = function (terminalCommand) {
        return __awaiter(this, void 0, void 0, function () {
            var analysis, error_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.aiHelper.analyzeCommand(terminalCommand, this.shellType)];
                    case 1:
                        analysis = _a.sent();
                        this.lastAnalysis = analysis;
                        // Send analysis to webview
                        if (this.panel) {
                            this.panel.webview.postMessage({
                                command: 'analysisResult',
                                analysis: analysis
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_3 = _a.sent();
                        vscode.window.showErrorMessage("Failed to analyze command: ".concat(error_3 instanceof Error ? error_3.message : String(error_3)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Generates variations of a command
     * @param terminalCommand Base command
     * @param description Description of variations needed
     */
    CommandGenerationWebview.prototype.generateVariations = function (terminalCommand, description) {
        return __awaiter(this, void 0, void 0, function () {
            var variations, error_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.aiHelper.generateCommandVariations(terminalCommand, description, this.shellType)];
                    case 1:
                        variations = _a.sent();
                        // Send variations to webview
                        if (this.panel) {
                            this.panel.webview.postMessage({
                                command: 'variationsResult',
                                variations: variations
                            });
                        }
                        return [3 /*break*/, 3];
                    case 2:
                        error_4 = _a.sent();
                        vscode.window.showErrorMessage("Failed to generate variations: ".concat(error_4 instanceof Error ? error_4.message : String(error_4)));
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Gets command history
     * @param shellType Shell type to filter by
     */
    CommandGenerationWebview.prototype.getCommandHistory = function (shellType) {
        return __awaiter(this, void 0, void 0, function () {
            var history_1;
            return __generator(this, function (_a) {
                try {
                    history_1 = this.interactiveShell.getCommandHistory(shellType);
                    // Send history to webview
                    if (this.panel) {
                        this.panel.webview.postMessage({
                            command: 'historyResult',
                            history: history_1
                        });
                    }
                }
                catch (error) {
                    vscode.window.showErrorMessage("Failed to get command history: ".concat(error instanceof Error ? error.message : String(error)));
                }
                return [2 /*return*/];
            });
        });
    };
    return CommandGenerationWebview;
}());
exports.CommandGenerationWebview = CommandGenerationWebview;
