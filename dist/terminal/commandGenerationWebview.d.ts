import * as vscode from 'vscode';
import { TerminalShellType } from './types';
import { AITerminalHelper } from './aiTerminalHelper';
import { InteractiveShell } from './interactiveShell';
/**
 * Webview panel for enhanced terminal command generation
 */
export declare class CommandGenerationWebview {
    private panel?;
    private context;
    private aiHelper;
    private interactiveShell;
    private shellType;
    private currentCommand;
    private lastAnalysis;
    constructor(context: vscode.ExtensionContext, aiHelper: AITerminalHelper, interactiveShell: InteractiveShell);
    /**
     * Shows the command generation panel
     * @param initialPrompt Initial natural language prompt
     * @param shellType Shell type to use
     */
    show(initialPrompt?: string, shellType?: TerminalShellType): Promise<void>;
    /**
     * Generates HTML content for the webview
     * @param shellType Current shell type
     * @param initialPrompt Initial prompt if any
     * @returns HTML content for the webview
     */
    private getWebviewContent;
    /**
     * Handles messages from the webview
     * @param message Message from the webview
     */
    private handleMessage;
    /**
     * Generates a command from natural language
     * @param description Natural language description
     */
    private generateCommand;
    /**
     * Runs a command in a terminal
     * @param terminalCommand Command to run
     */
    private runCommand;
    /**
     * Analyzes a command
     * @param terminalCommand Command to analyze
     */
    private analyzeCommand;
    /**
     * Generates variations of a command
     * @param terminalCommand Base command
     * @param description Description of variations needed
     */
    private generateVariations;
    /**
     * Gets command history
     * @param shellType Shell type to filter by
     */
    private getCommandHistory;
}
