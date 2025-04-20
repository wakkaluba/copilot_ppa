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
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TerminalModule = void 0;
const vscode = __importStar(require("vscode"));
const terminalManager_1 = require("./terminalManager");
const interactiveShell_1 = require("./interactiveShell");
const aiTerminalHelper_1 = require("./aiTerminalHelper");
const types_1 = require("./types");
const commandGenerationWebview_1 = require("./commandGenerationWebview");
__exportStar(require("./types"), exports);
__exportStar(require("./terminalManager"), exports);
__exportStar(require("./interactiveShell"), exports);
__exportStar(require("./aiTerminalHelper"), exports);
/**
 * Terminal module that integrates all terminal functionality
 */
class TerminalModule {
    terminalManager;
    interactiveShell;
    aiHelper = null;
    context;
    llmManager = null;
    commandGenerationWebview = null;
    constructor(context) {
        this.context = context;
        this.terminalManager = new terminalManager_1.TerminalManager();
        this.interactiveShell = new interactiveShell_1.InteractiveShell(this.terminalManager);
    }
    /**
     * Sets the LLM provider manager for AI features
     * @param llmManager LLM provider manager instance
     */
    setLLMManager(llmManager) {
        this.llmManager = llmManager;
        this.aiHelper = new aiTerminalHelper_1.AITerminalHelper(llmManager, this.interactiveShell, this.context);
        // Initialize command generation webview if AI helper is available
        if (this.aiHelper) {
            this.commandGenerationWebview = new commandGenerationWebview_1.CommandGenerationWebview(this.context, this.aiHelper, this.interactiveShell);
        }
    }
    /**
     * Initializes terminal functionality and registers commands
     */
    initialize() {
        this.registerCommands();
    }
    /**
     * Registers all terminal-related commands
     */
    registerCommands() {
        // Register terminal creation commands
        this.context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.terminal.createTerminal', async () => {
            const shellType = await this.selectShellType();
            if (shellType) {
                const name = await vscode.window.showInputBox({
                    placeHolder: 'Terminal name',
                    value: `Agent Terminal (${shellType})`
                });
                if (name) {
                    this.terminalManager.showTerminal(name, shellType);
                }
            }
        }));
        // Register command execution commands
        this.context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.terminal.executeCommand', async () => {
            const command = await vscode.window.showInputBox({
                placeHolder: 'Enter command to execute'
            });
            if (command) {
                const shellType = await this.selectShellType();
                if (shellType) {
                    try {
                        const output = await this.interactiveShell.executeCommand(command, shellType);
                        vscode.window.showInformationMessage(`Command executed successfully`);
                    }
                    catch (error) {
                        vscode.window.showErrorMessage(`Command failed: ${error instanceof Error ? error.message : String(error)}`);
                        // Offer to analyze the failure if AI helper is available
                        if (this.aiHelper) {
                            const analyze = await vscode.window.showWarningMessage('Do you want AI to analyze the error?', 'Yes', 'No');
                            if (analyze === 'Yes') {
                                const errorMessage = error instanceof Error ? error.message : String(error);
                                const fixes = await this.aiHelper.analyzeFailedCommand(command, errorMessage, shellType);
                                if (fixes.length > 0) {
                                    // Show quick pick with fix suggestions
                                    const selectedFix = await vscode.window.showQuickPick(fixes, {
                                        placeHolder: 'Select a suggested fix to run'
                                    });
                                    if (selectedFix) {
                                        await this.interactiveShell.executeCommand(selectedFix, shellType);
                                    }
                                }
                                else {
                                    vscode.window.showInformationMessage('No fix suggestions available');
                                }
                            }
                        }
                    }
                }
            }
        }));
        // Register AI command suggestion command
        if (this.aiHelper) {
            this.context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.terminal.suggestCommands', async () => {
                const context = await vscode.window.showInputBox({
                    placeHolder: 'Describe what you want to do'
                });
                if (context && this.aiHelper) {
                    const shellType = await this.selectShellType();
                    if (shellType) {
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: 'Generating command suggestions...',
                            cancellable: false
                        }, async (progress) => {
                            try {
                                const suggestions = await this.aiHelper.suggestCommands(context, shellType);
                                if (suggestions.length > 0) {
                                    const selectedCommand = await vscode.window.showQuickPick(suggestions, {
                                        placeHolder: 'Select a command to run'
                                    });
                                    if (selectedCommand) {
                                        await this.interactiveShell.executeCommand(selectedCommand, shellType);
                                    }
                                }
                                else {
                                    vscode.window.showInformationMessage('No command suggestions available');
                                }
                            }
                            catch (error) {
                                vscode.window.showErrorMessage(`Failed to generate suggestions: ${error instanceof Error ? error.message : String(error)}`);
                            }
                        });
                    }
                }
            }));
            // Register AI command generation command
            this.context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.terminal.generateCommand', async () => {
                const description = await vscode.window.showInputBox({
                    placeHolder: 'Describe the command you need in natural language'
                });
                if (description && this.aiHelper) {
                    const shellType = await this.selectShellType();
                    if (shellType) {
                        vscode.window.withProgress({
                            location: vscode.ProgressLocation.Notification,
                            title: 'Generating command...',
                            cancellable: false
                        }, async (progress) => {
                            try {
                                const command = await this.aiHelper.generateCommandFromDescription(description, shellType);
                                if (command) {
                                    // Show the command with option to run it
                                    const action = await vscode.window.showInformationMessage(`Generated command: ${command}`, 'Run', 'Copy', 'Cancel');
                                    if (action === 'Run') {
                                        await this.interactiveShell.executeCommand(command, shellType);
                                    }
                                    else if (action === 'Copy') {
                                        await vscode.env.clipboard.writeText(command);
                                    }
                                }
                                else {
                                    vscode.window.showInformationMessage('No command could be generated from the description');
                                }
                            }
                            catch (error) {
                                vscode.window.showErrorMessage(`Failed to generate command: ${error instanceof Error ? error.message : String(error)}`);
                            }
                        });
                    }
                }
            }));
            // Register command generation webview command
            this.context.subscriptions.push(vscode.commands.registerCommand('localLlmAgent.terminal.openCommandGenerator', async () => {
                if (this.commandGenerationWebview) {
                    const initialPrompt = await vscode.window.showInputBox({
                        placeHolder: 'Describe what you want to do (optional)'
                    });
                    const shellType = await this.selectShellType() || types_1.TerminalShellType.VSCodeDefault;
                    this.commandGenerationWebview.show(initialPrompt || '', shellType);
                }
                else {
                    vscode.window.showErrorMessage('Command generation is not available without an LLM provider');
                }
            }));
        }
    }
    /**
     * Helper method to prompt user for shell type selection
     * @returns Promise that resolves with selected shell type or undefined
     */
    async selectShellType() {
        const shells = [
            { label: 'Default VS Code Terminal', value: types_1.TerminalShellType.VSCodeDefault },
            { label: 'PowerShell', value: types_1.TerminalShellType.PowerShell },
            { label: 'Git Bash', value: types_1.TerminalShellType.GitBash }
        ];
        // Add WSL option only on Windows
        if (process.platform === 'win32') {
            shells.push({ label: 'WSL Bash', value: types_1.TerminalShellType.WSLBash });
        }
        const selected = await vscode.window.showQuickPick(shells, {
            placeHolder: 'Select shell type'
        });
        return selected?.value;
    }
    /**
     * Returns the terminal manager instance
     */
    getTerminalManager() {
        return this.terminalManager;
    }
    /**
     * Returns the interactive shell instance
     */
    getInteractiveShell() {
        return this.interactiveShell;
    }
    /**
     * Returns the AI terminal helper instance if available
     */
    getAIHelper() {
        return this.aiHelper;
    }
}
exports.TerminalModule = TerminalModule;
//# sourceMappingURL=index.js.map