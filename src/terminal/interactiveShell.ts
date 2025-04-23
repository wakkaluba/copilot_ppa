import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { TerminalManager } from './terminalManager';
import { ILogger } from '../logging/ILogger';
import { TerminalShellType, CommandHistoryEntry, CommandGenerationResult, CommandAnalysis } from './types';
import { ShellConfigurationService } from './services/ShellConfigurationService';
import { CommandExecutionService } from './services/CommandExecutionService';
import { OutputProcessingService } from './services/OutputProcessingService';

@injectable()
export class InteractiveShell implements vscode.Disposable {
    private readonly commandHistory: CommandHistoryEntry[] = [];
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(TerminalManager) private readonly terminalManager: TerminalManager,
        @inject(ILogger) private readonly logger: ILogger,
        @inject(ShellConfigurationService) private readonly shellConfig: ShellConfigurationService,
        @inject(CommandExecutionService) private readonly commandExecutor: CommandExecutionService,
        @inject(OutputProcessingService) private readonly outputProcessor: OutputProcessingService
    ) {
        this.outputChannel = vscode.window.createOutputChannel('Terminal Output');
    }

    async executeCommand(
        command: string,
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault,
        showOutput: boolean = true
    ): Promise<string> {
        this.logger.debug(`Executing command: ${command} (shell: ${shellType})`);
        
        try {
            // Create history entry
            const historyEntry: CommandHistoryEntry = {
                command,
                timestamp: new Date(),
                shellType
            };

            // Execute command
            const output = await this.commandExecutor.executeWithOutput(command, shellType);
            
            // Update history
            historyEntry.result = output;
            this.addToCommandHistory(historyEntry);

            // Show output if requested
            if (showOutput) {
                this.showCommandOutput(command, output.stdout);
            }

            return output.stdout;
        } catch (error) {
            this.handleCommandError(command, error);
            throw error;
        }
    }

    /**
     * Executes a command in a visible terminal without capturing output
     * @param command Command to execute
     * @param terminalName Name for the terminal
     * @param shellType Shell type to use
     */
    public async executeInTerminal(
        command: string,
        terminalName: string = 'Agent Terminal',
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault
    ): Promise<void> {
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
    public async executeCommands(
        commands: string[],
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault,
        showOutput: boolean = true
    ): Promise<string[]> {
        const results: string[] = [];
        
        for (const command of commands) {
            try {
                const output = await this.executeCommand(command, shellType, showOutput);
                results.push(output);
            } catch (error) {
                // Add error output as undefined
                results.push('');
                
                // Decide whether to continue after an error
                const continueExecution = await vscode.window.showErrorMessage(
                    `Command failed: ${command}`,
                    'Continue',
                    'Stop'
                );
                
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
    private showCommandOutput(command: string, output: string): void {
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
    private showCommandError(command: string, error: unknown): void {
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
    public getCommandHistory(shellType?: TerminalShellType, limit?: number): CommandHistoryEntry[] {
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
    public clearCommandHistory(): void {
        this.commandHistory = [];
    }

    /**
     * Adds a command to history, maintaining the max history size
     * @param entry Command history entry to add
     */
    private addToCommandHistory(entry: CommandHistoryEntry): void {
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
    public processOutput(output: string, options: OutputProcessingOptions): string {
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
                } else {
                    // Exclude lines that match the pattern
                    const lines = processedOutput.split('\n');
                    processedOutput = lines.filter(line => !regex.test(line)).join('\n');
                }
            } catch (error) {
                vscode.window.showErrorMessage(`Invalid regex pattern: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
        
        return processedOutput;
    }

    /**
     * Strips ANSI escape codes from terminal output
     * @param text Text to process
     */
    private stripAnsiCodes(text: string): string {
        // This regex pattern matches ANSI escape sequences
        return text.replace(/\\u001B\[[0-9;]*[a-zA-Z]/g, '');
    }

    /**
     * Gets command suggestions from the AI helper based on natural language
     * @param description Natural language description
     * @param shellType Shell type to use
     * @returns Promise with generated command result
     */
    public async getCommandFromNaturalLanguage(
        description: string,
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault
    ): Promise<CommandGenerationResult | null> {
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
    public async getCommandAnalysis(
        command: string,
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault
    ): Promise<CommandAnalysis | null> {
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
    public async getCommandVariations(
        command: string,
        description: string,
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault
    ): Promise<string[]> {
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
    private async getAIHelper(): Promise<any> {
        try {
            const terminalModule = await vscode.commands.executeCommand('localLlmAgent.getTerminalModule');
            if (terminalModule) {
                return terminalModule.getAIHelper();
            }
            return null;
        } catch (error) {
            console.error('Failed to get AI Terminal Helper:', error);
            return null;
        }
    }

    private handleCommandError(command: string, error: unknown): void {
        this.logger.error(`Command failed: ${command}`, error);
        
        const historyEntry: CommandHistoryEntry = {
            command,
            timestamp: new Date(),
            shellType: TerminalShellType.VSCodeDefault,
            result: {
                stdout: '',
                stderr: error instanceof Error ? error.message : String(error),
                exitCode: 1,
                success: false
            }
        };
        
        this.addToCommandHistory(historyEntry);
        this.showCommandError(command, error);
    }

    public dispose(): void {
        this.outputChannel.dispose();
    }
}

/**
 * Options for processing terminal output
 */
interface OutputProcessingOptions {
    removeAnsiCodes?: boolean;
    trimWhitespace?: boolean;
    limitLines?: number;
    filterPattern?: string;
    filterFlags?: string;
    filterMode?: 'include' | 'exclude';
}
