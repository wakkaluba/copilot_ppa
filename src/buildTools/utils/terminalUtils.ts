import * as vscode from 'vscode';

export interface RunInTerminalOptions {
    command: string;
    explanation: string;
    isBackground: boolean;
}

export async function run_in_terminal(options: RunInTerminalOptions): Promise<void> {
    const terminal = vscode.window.createTerminal('Build Script Optimizer');
    
    try {
        terminal.show();
        terminal.sendText(options.command);

        if (!options.isBackground) {
            // For non-background commands, we want to dispose the terminal after completion
            const disposable = vscode.window.onDidCloseTerminal(closedTerminal => {
                if (closedTerminal === terminal) {
                    disposable.dispose();
                    if (closedTerminal.exitStatus && closedTerminal.exitStatus.code !== 0) {
                        throw new Error(`Command failed with exit code ${closedTerminal.exitStatus.code}`);
                    }
                }
            });
        }
    } catch (error) {
        terminal.dispose();
        throw error;
    }
}