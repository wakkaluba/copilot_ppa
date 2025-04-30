import * as vscode from 'vscode';
import { TerminalShellType } from './types';
import { InteractiveShell } from './interactiveShell';
import { LLMProviderManager } from '../llm/providerManager';
/**
 * Provides AI-powered assistance for terminal commands
 */
export declare class AITerminalHelper {
    private llmManager;
    private interactiveShell;
    private context;
    constructor(llmManager: LLMProviderManager, interactiveShell: InteractiveShell, context: vscode.ExtensionContext);
    /**
     * Suggests terminal commands based on the current context
     * @param context Text description of what the user wants to do
     * @param shellType Target shell for command suggestions
     * @returns Promise that resolves with suggested commands
     */
    suggestCommands(context: string, shellType?: TerminalShellType): Promise<string[]>;
    /**
     * Analyzes a failed command and suggests fixes
     * @param command The command that failed
     * @param error The error message
     * @param shellType The shell type used
     * @returns Promise that resolves with suggested fixes
     */
    analyzeFailedCommand(command: string, error: string, shellType: TerminalShellType): Promise<string[]>;
    /**
     * Generates a terminal command from natural language description with enhanced context awareness
     * @param description Natural language description of what to do
     * @param shellType Target shell type
     * @param includeContextualInfo Whether to include workspace context in the prompt
     * @returns Promise that resolves with generated command
     */
    generateCommandFromDescription(description: string, shellType: TerminalShellType, includeContextualInfo?: boolean): Promise<CommandGenerationResult>;
    /**
     * Builds contextual information about the workspace to improve command generation
     * @param workspacePath Path to the workspace
     * @returns Contextual information as a string
     */
    private buildContextInformation;
    /**
     * Checks if a directory contains files with specific extensions
     * @param directory Directory to check
     * @param extensions File extensions to look for
     * @returns True if files with the specified extensions exist
     */
    private checkForFileTypes;
    /**
     * Parses the structured response from command generation
     * @param response LLM response text
     * @returns Parsed command generation result
     */
    private parseCommandGenerationResponse;
    /**
     * Validates basic shell syntax for a generated command
     * @param command Command to validate
     * @param shellType Shell type to validate against
     * @returns Whether the command appears syntactically valid
     */
    private validateCommandSyntax;
    /**
     * Analyzes a command to provide detailed explanations of its components
     * @param command Command to analyze
     * @param shellType Shell type to analyze for
     * @returns Promise that resolves with command analysis
     */
    analyzeCommand(command: string, shellType: TerminalShellType): Promise<CommandAnalysis>;
    /**
     * Parses command analysis from LLM response
     * @param response LLM response text
     * @returns Parsed command analysis
     */
    private parseCommandAnalysis;
    /**
     * Generates command variations with different parameters
     * @param baseCommand Base command to vary
     * @param description Description of what variations are needed
     * @param shellType Shell type to use
     * @returns Promise that resolves with command variations
     */
    generateCommandVariations(baseCommand: string, description: string, shellType: TerminalShellType): Promise<string[]>;
    /**
     * Parses command variations from LLM response
     * @param response LLM response text
     * @returns Array of command variations
     */
    private parseCommandVariations;
    /**
     * Parses command suggestions from LLM response
     * @param response LLM response text
     * @returns Array of suggested commands
     */
    private parseCommandSuggestions;
    /**
     * Parses fix suggestions from LLM response
     * @param response LLM response text
     * @returns Array of suggested fixes
     */
    private parseFixSuggestions;
    /**
     * Cleans up the generated command response
     * @param response LLM response text
     * @returns Clean command string
     */
    private cleanGeneratedCommand;
    /**
     * Formats command history for inclusion in prompts
     * @param shellType Shell type to filter by
     * @returns Formatted command history text
     */
    private formatCommandHistoryForPrompt;
}
/**
 * Result of command generation
 */
export interface CommandGenerationResult {
    command: string;
    explanation: string;
    warnings: string;
    alternatives: string[];
    isValid: boolean;
}
/**
 * Analysis of a command
 */
export interface CommandAnalysis {
    purpose: string;
    components: string[];
    risks: string[];
    performance: string;
    alternatives: string[];
}
