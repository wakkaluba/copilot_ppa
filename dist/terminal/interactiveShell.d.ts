import * as vscode from 'vscode';
import { TerminalManager } from './terminalManager';
import { ILogger } from '../logging/ILogger';
import { TerminalShellType, CommandHistoryEntry, CommandGenerationResult, CommandAnalysis } from './types';
import { ShellConfigurationService } from './services/ShellConfigurationService';
import { CommandExecutionService } from './services/CommandExecutionService';
import { OutputProcessingService } from './services/OutputProcessingService';
export declare class InteractiveShell implements vscode.Disposable {
    private readonly terminalManager;
    private readonly logger;
    private readonly shellConfig;
    private readonly commandExecutor;
    private readonly outputProcessor;
    private readonly commandHistory;
    private readonly outputChannel;
    constructor(terminalManager: TerminalManager, logger: ILogger, shellConfig: ShellConfigurationService, commandExecutor: CommandExecutionService, outputProcessor: OutputProcessingService);
    executeCommand(command: string, shellType?: TerminalShellType, showOutput?: boolean): Promise<string>;
    /**
     * Executes a command in a visible terminal without capturing output
     * @param command Command to execute
     * @param terminalName Name for the terminal
     * @param shellType Shell type to use
     */
    executeInTerminal(command: string, terminalName?: string, shellType?: TerminalShellType): Promise<void>;
    /**
     * Executes multiple commands in sequence
     * @param commands Array of commands to execute
     * @param shellType Shell type to use
     * @param showOutput Whether to show output
     * @returns Promise that resolves with array of outputs
     */
    executeCommands(commands: string[], shellType?: TerminalShellType, showOutput?: boolean): Promise<string[]>;
    /**
     * Formats and displays command output in an OutputChannel
     * @param command The executed command
     * @param output The command output
     */
    private showCommandOutput;
    /**
     * Formats and displays command error in an OutputChannel
     * @param command The executed command
     * @param error The error
     */
    private showCommandError;
    /**
     * Get command history for the specified shell
     * @param shellType Shell type to filter by, or undefined for all shell types
     * @param limit Maximum number of history entries to return
     */
    getCommandHistory(shellType?: TerminalShellType, limit?: number): CommandHistoryEntry[];
    /**
     * Clears command history
     */
    clearCommandHistory(): void;
    /**
     * Adds a command to history, maintaining the max history size
     * @param entry Command history entry to add
     */
    private addToCommandHistory;
    /**
     * Process terminal output with various transformations
     * @param output Raw terminal output
     * @param options Processing options
     */
    processOutput(output: string, options: OutputProcessingOptions): string;
    /**
     * Strips ANSI escape codes from terminal output
     * @param text Text to process
     */
    private stripAnsiCodes;
    /**
     * Gets command suggestions from the AI helper based on natural language
     * @param description Natural language description
     * @param shellType Shell type to use
     * @returns Promise with generated command result
     */
    getCommandFromNaturalLanguage(description: string, shellType?: TerminalShellType): Promise<CommandGenerationResult | null>;
    /**
     * Gets command analysis from the AI helper
     * @param command Command to analyze
     * @param shellType Shell type
     * @returns Promise with command analysis
     */
    getCommandAnalysis(command: string, shellType?: TerminalShellType): Promise<CommandAnalysis | null>;
    /**
     * Gets command variations from the AI helper
     * @param command Base command
     * @param description Description of variations needed
     * @param shellType Shell type
     * @returns Promise with array of command variations
     */
    getCommandVariations(command: string, description: string, shellType?: TerminalShellType): Promise<string[]>;
    /**
     * Gets the AI Terminal Helper from the extension
     * @returns Promise with AI Terminal Helper or null
     */
    private getAIHelper;
    private handleCommandError;
    dispose(): void;
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
export {};
