import * as vscode from 'vscode';
import { TerminalManager } from './terminalManager';
import { InteractiveShell } from './interactiveShell';
import { AITerminalHelper } from './aiTerminalHelper';
import { TerminalShellType } from './types';
import { LLMProviderManager } from '../llm/providerManager';
import { CommandGenerationWebview } from './commandGenerationWebview';

export * from './types';
export * from './terminalManager';
export * from './interactiveShell';
export * from './aiTerminalHelper';

/**
 * Terminal module that integrates all terminal functionality
 */
export class TerminalModule {
    private terminalManager: TerminalManager;
    private interactiveShell: InteractiveShell;
    private aiHelper: AITerminalHelper | null = null;
    private context: vscode.ExtensionContext;
    private llmManager: LLMProviderManager | null = null;
    private commandGenerationWebview: CommandGenerationWebview | null = null;

    constructor(context: vscode.ExtensionContext) {
        this.context = context;
        this.terminalManager = new TerminalManager();
        this.interactiveShell = new InteractiveShell(this.terminalManager);
    }

    /**
     * Sets the LLM provider manager for AI features
     * @param llmManager LLM provider manager instance
     */
    public setLLMManager(llmManager: LLMProviderManager): void {
        this.llmManager = llmManager;
        this.aiHelper = new AITerminalHelper(llmManager, this.interactiveShell, this.context);
        
        // Initialize command generation webview if AI helper is available
        if (this.aiHelper) {
            this.commandGenerationWebview = new CommandGenerationWebview(
                this.context,
                this.aiHelper,
                this.interactiveShell
            );
        }
    }

    /**
     * Initializes terminal functionality and registers commands
     */
    public initialize(): void {
        this.registerCommands();
    }

    /**
     * Registers all terminal-related commands
     */
    private registerCommands(): void {
        // Register terminal creation commands
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLlmAgent.terminal.createTerminal', async () => {
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
            })
        );
        
        // Register command execution commands
        this.context.subscriptions.push(
            vscode.commands.registerCommand('localLlmAgent.terminal.executeCommand', async () => {
                const command = await vscode.window.showInputBox({
                    placeHolder: 'Enter command to execute'
                });
                
                if (command) {
                    const shellType = await this.selectShellType();
                    if (shellType) {
                        try {
                            const output = await this.interactiveShell.executeCommand(command, shellType);
                            vscode.window.showInformationMessage(`Command executed successfully`);
                        } catch (error) {
                            vscode.window.showErrorMessage(`Command failed: ${error instanceof Error ? error.message : String(error)}`);
                            
                            // Offer to analyze the failure if AI helper is available
                            if (this.aiHelper) {
                                const analyze = await vscode.window.showWarningMessage(
                                    'Do you want AI to analyze the error?',
                                    'Yes',
                                    'No'
                                );
                                
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
                                    } else {
                                        vscode.window.showInformationMessage('No fix suggestions available');
                                    }
                                }
                            }
                        }
                    }
                }
            })
        );
        
        // Register AI command suggestion command
        if (this.aiHelper) {
            this.context.subscriptions.push(
                vscode.commands.registerCommand('localLlmAgent.terminal.suggestCommands', async () => {
                    const context = await vscode.window.showInputBox({
                        placeHolder: 'Describe what you want to do'
                    });
                    
                    if (context && this.aiHelper) {
                        const shellType = await this.selectShellType();
                        if (shellType) {
                            vscode.window.withProgress(
                                {
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Generating command suggestions...',
                                    cancellable: false
                                },
                                async (progress) => {
                                    try {
                                        const suggestions = await this.aiHelper!.suggestCommands(context, shellType);
                                        
                                        if (suggestions.length > 0) {
                                            const selectedCommand = await vscode.window.showQuickPick(suggestions, {
                                                placeHolder: 'Select a command to run'
                                            });
                                            
                                            if (selectedCommand) {
                                                await this.interactiveShell.executeCommand(selectedCommand, shellType);
                                            }
                                        } else {
                                            vscode.window.showInformationMessage('No command suggestions available');
                                        }
                                    } catch (error) {
                                        vscode.window.showErrorMessage(`Failed to generate suggestions: ${error instanceof Error ? error.message : String(error)}`);
                                    }
                                }
                            );
                        }
                    }
                })
            );
            
            // Register AI command generation command
            this.context.subscriptions.push(
                vscode.commands.registerCommand('localLlmAgent.terminal.generateCommand', async () => {
                    const description = await vscode.window.showInputBox({
                        placeHolder: 'Describe the command you need in natural language'
                    });
                    
                    if (description && this.aiHelper) {
                        const shellType = await this.selectShellType();
                        if (shellType) {
                            vscode.window.withProgress(
                                {
                                    location: vscode.ProgressLocation.Notification,
                                    title: 'Generating command...',
                                    cancellable: false
                                },
                                async (progress) => {
                                    try {
                                        const command = await this.aiHelper!.generateCommandFromDescription(description, shellType);
                                        
                                        if (command) {
                                            // Show the command with option to run it
                                            const action = await vscode.window.showInformationMessage(
                                                `Generated command: ${command}`,
                                                'Run',
                                                'Copy',
                                                'Cancel'
                                            );
                                            
                                            if (action === 'Run') {
                                                await this.interactiveShell.executeCommand(command, shellType);
                                            } else if (action === 'Copy') {
                                                await vscode.env.clipboard.writeText(command);
                                            }
                                        } else {
                                            vscode.window.showInformationMessage('No command could be generated from the description');
                                        }
                                    } catch (error) {
                                        vscode.window.showErrorMessage(`Failed to generate command: ${error instanceof Error ? error.message : String(error)}`);
                                    }
                                }
                            );
                        }
                    }
                })
            );

            // Register command generation webview command
            this.context.subscriptions.push(
                vscode.commands.registerCommand('localLlmAgent.terminal.openCommandGenerator', async () => {
                    if (this.commandGenerationWebview) {
                        const initialPrompt = await vscode.window.showInputBox({
                            placeHolder: 'Describe what you want to do (optional)'
                        });
                        
                        const shellType = await this.selectShellType() || TerminalShellType.VSCodeDefault;
                        this.commandGenerationWebview.show(initialPrompt || '', shellType);
                    } else {
                        vscode.window.showErrorMessage('Command generation is not available without an LLM provider');
                    }
                })
            );
        }
    }

    /**
     * Helper method to prompt user for shell type selection
     * @returns Promise that resolves with selected shell type or undefined
     */
    private async selectShellType(): Promise<TerminalShellType | undefined> {
        const shells = [
            { label: 'Default VS Code Terminal', value: TerminalShellType.VSCodeDefault },
            { label: 'PowerShell', value: TerminalShellType.PowerShell },
            { label: 'Git Bash', value: TerminalShellType.GitBash }
        ];
        
        // Add WSL option only on Windows
        if (process.platform === 'win32') {
            shells.push({ label: 'WSL Bash', value: TerminalShellType.WSLBash });
        }
        
        const selected = await vscode.window.showQuickPick(shells, {
            placeHolder: 'Select shell type'
        });
        
        return selected?.value;
    }

    /**
     * Returns the terminal manager instance
     */
    public getTerminalManager(): TerminalManager {
        return this.terminalManager;
    }

    /**
     * Returns the interactive shell instance
     */
    public getInteractiveShell(): InteractiveShell {
        return this.interactiveShell;
    }

    /**
     * Returns the AI terminal helper instance if available
     */
    public getAIHelper(): AITerminalHelper | null {
        return this.aiHelper;
    }
}
