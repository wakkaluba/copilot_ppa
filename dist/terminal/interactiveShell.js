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
exports.InteractiveShell = void 0;
const vscode = __importStar(require("vscode"));
const types_1 = require("./types");
/**
 * Provides interactive terminal capabilities with enhanced features
 */
class InteractiveShell {
    terminalManager;
    commandHistory = [];
    outputChannel;
    maxHistorySize = 100; // Maximum number of commands to remember
    aiHelper; // Replace with the correct type if known
    constructor(terminalManager) {
        this.terminalManager = terminalManager;
        this.outputChannel = vscode.window.createOutputChannel('Terminal Output');
    }
    /**
     * Executes a command and captures the output
     * @param command Command to execute
     * @param shellType Shell type to use
     * @param showOutput Whether to show output in an output channel
     * @returns Promise that resolves with the command output
     */
    async executeCommand(command, shellType = types_1.TerminalShellType.VSCodeDefault, showOutput = true) {
        try {
            // Record command in history
            const historyEntry = {
                command,
                timestamp: new Date(),
                shellType
            };
            // Execute command and capture output
            const output = await this.terminalManager.executeCommandWithOutput(command, shellType);
            // Add result to history
            historyEntry.result = {
                stdout: output,
                stderr: '',
                exitCode: 0,
                success: true
            };
            this.addToCommandHistory(historyEntry);
            // Display output if requested
            if (showOutput) {
                this.showCommandOutput(command, output);
            }
            return output;
        }
        catch (error) {
            // Record error in history
            const historyEntry = {
                command,
                timestamp: new Date(),
                shellType,
                result: {
                    stdout: '',
                    stderr: error instanceof Error ? error.message : String(error),
                    exitCode: 1,
                    success: false
                }
            };
            this.addToCommandHistory(historyEntry);
            // Display error if requested
            if (showOutput) {
                this.showCommandError(command, error);
            }
            throw error;
        }
    }
    /**
     * Executes a command in a visible terminal without capturing output
     * @param command Command to execute
     * @param terminalName Name for the terminal
     * @param shellType Shell type to use
     */
    async executeInTerminal(command, terminalName = 'Agent Terminal', shellType = types_1.TerminalShellType.VSCodeDefault) {
        // Create or show terminal
        this.terminalManager.showTerminal(terminalName, shellType);
        // Execute command
        await this.terminalManager.executeCommand(command, terminalName);
        // Add to history without result (we don't capture output in this mode)
        this.addToCommandHistory({
            command,
            timestamp: new Date(),
            shellType
        });
    }
    /**
     * Executes multiple commands in sequence
     * @param commands Array of commands to execute
     * @param shellType Shell type to use
     * @param showOutput Whether to show output
     * @returns Promise that resolves with array of outputs
     */
    async executeCommands(commands, shellType = types_1.TerminalShellType.VSCodeDefault, showOutput = true) {
        const results = [];
        for (const command of commands) {
            try {
                const output = await this.executeCommand(command, shellType, showOutput);
                results.push(output);
            }
            catch (error) {
                // Add error output as undefined
                results.push('');
                // Decide whether to continue after an error
                const continueExecution = await vscode.window.showErrorMessage(`Command failed: ${command}`, 'Continue', 'Stop');
                if (continueExecution !== 'Continue') {
                    break;
                }
            }
        }
        return results;
    }
    /**
     * Formats and displays command output in an OutputChannel
     * @param command The executed command
     * @param output The command output
     */
    showCommandOutput(command, output) {
        this.outputChannel.appendLine(`> ${command}`);
        this.outputChannel.appendLine(output);
        this.outputChannel.appendLine(''); // Empty line for separation
        this.outputChannel.show();
    }
    /**
     * Formats and displays command error in an OutputChannel
     * @param command The executed command
     * @param error The error
     */
    showCommandError(command, error) {
        this.outputChannel.appendLine(`> ${command}`);
        this.outputChannel.appendLine(`Error: ${error instanceof Error ? error.message : String(error)}`);
        this.outputChannel.appendLine(''); // Empty line for separation
        this.outputChannel.show();
    }
    /**
     * Get command history for the specified shell
     * @param shellType Shell type to filter by, or undefined for all shell types
     * @param limit Maximum number of history entries to return
     */
    getCommandHistory(shellType, limit) {
        let history = [...this.commandHistory];
        // Filter by shell type if specified
        if (shellType) {
            history = history.filter(entry => entry.shellType === shellType);
        }
        // Sort by timestamp (newest first)
        history.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        // Apply limit if specified
        if (limit && limit > 0) {
            history = history.slice(0, limit);
        }
        return history;
    }
    /**
     * Clears command history
     */
    clearCommandHistory() {
        this.commandHistory = [];
    }
    /**
     * Adds a command to history, maintaining the max history size
     * @param entry Command history entry to add
     */
    addToCommandHistory(entry) {
        this.commandHistory.push(entry);
        // Trim history if it exceeds max size
        if (this.commandHistory.length > this.maxHistorySize) {
            this.commandHistory = this.commandHistory.slice(-this.maxHistorySize);
        }
    }
    /**
     * Process terminal output with various transformations
     * @param output Raw terminal output
     * @param options Processing options
     */
    processOutput(output, options) {
        let processedOutput = output;
        if (options.removeAnsiCodes) {
            processedOutput = this.stripAnsiCodes(processedOutput);
        }
        if (options.trimWhitespace) {
            processedOutput = processedOutput.trim();
        }
        if (options.limitLines && options.limitLines > 0) {
            const lines = processedOutput.split('\n');
            processedOutput = lines.slice(0, options.limitLines).join('\n');
            // Add indicator if lines were removed
            if (lines.length > options.limitLines) {
                processedOutput += `\n... (${lines.length - options.limitLines} more lines)`;
            }
        }
        if (options.filterPattern) {
            try {
                const regex = new RegExp(options.filterPattern, options.filterFlags || '');
                if (options.filterMode === 'include') {
                    // Include only lines that match the pattern
                    const lines = processedOutput.split('\n');
                    processedOutput = lines.filter(line => regex.test(line)).join('\n');
                }
                else {
                    // Exclude lines that match the pattern
                    const lines = processedOutput.split('\n');
                    processedOutput = lines.filter(line => !regex.test(line)).join('\n');
                }
            }
            catch (error) {
                vscode.window.showErrorMessage(`Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        return processedOutput;
    }
    /**
     * Strips ANSI escape codes from terminal output
     * @param text Text to process
     */
    stripAnsiCodes(text) {
        // This regex pattern matches ANSI escape sequences
        return text.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, '');
    }
    /**
     * Gets command suggestions from the AI helper based on natural language
     * @param description Natural language description
     * @param shellType Shell type to use
     * @returns Promise with generated command result
     */
    async getCommandFromNaturalLanguage(description, shellType = types_1.TerminalShellType.VSCodeDefault) {
        // Get the AI Terminal Helper from the extension
        const aiHelper = await this.getAIHelper();
        if (!aiHelper) {
            vscode.window.showErrorMessage('AI Terminal Helper is not available');
            return null;
        }
        // Generate command
        const result = await aiHelper.generateCommandFromDescription(description, shellType, true);
        return result;
    }
    /**
     * Gets command analysis from the AI helper
     * @param command Command to analyze
     * @param shellType Shell type
     * @returns Promise with command analysis
     */
    async getCommandAnalysis(command, shellType = types_1.TerminalShellType.VSCodeDefault) {
        // Get the AI Terminal Helper from the extension
        const aiHelper = await this.getAIHelper();
        if (!aiHelper) {
            vscode.window.showErrorMessage('AI Terminal Helper is not available');
            return null;
        }
        // Analyze command
        const analysis = await aiHelper.analyzeCommand(command, shellType);
        return analysis;
    }
    /**
     * Gets command variations from the AI helper
     * @param command Base command
     * @param description Description of variations needed
     * @param shellType Shell type
     * @returns Promise with array of command variations
     */
    async getCommandVariations(command, description, shellType = types_1.TerminalShellType.VSCodeDefault) {
        // Get the AI Terminal Helper from the extension
        const aiHelper = await this.getAIHelper();
        if (!aiHelper) {
            vscode.window.showErrorMessage('AI Terminal Helper is not available');
            return [];
        }
        // Generate variations
        const variations = await aiHelper.generateCommandVariations(command, description, shellType);
        return variations;
    }
    /**
     * Gets the AI Terminal Helper from the extension
     * @returns Promise with AI Terminal Helper or null
     */
    async getAIHelper() {
        try {
            const terminalModule = await vscode.commands.executeCommand('localLlmAgent.getTerminalModule');
            if (terminalModule) {
                return terminalModule.getAIHelper();
            }
            return null;
        }
        catch (error) {
            console.error('Failed to get AI Terminal Helper:', error);
            return null;
        }
    }
    getAIHelper() {
        return this.aiHelper; // Assuming 'aiHelper' is a property of the class
    }
}
exports.InteractiveShell = InteractiveShell;
//# sourceMappingURL=interactiveShell.js.map