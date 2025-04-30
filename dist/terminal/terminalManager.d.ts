import * as vscode from 'vscode';
import { TerminalShellType } from './types';
export declare class TerminalManager {
    private readonly shellService;
    private readonly commandExecutor;
    private readonly lifecycleService;
    constructor();
    createTerminal(name: string, shellType: TerminalShellType): vscode.Terminal;
    showTerminal(name: string, shellType: TerminalShellType): void;
    executeCommand(command: string, terminalName?: string): Promise<void>;
    executeCommandWithOutput(command: string, shellType?: TerminalShellType): Promise<string>;
    getActiveTerminals(): Map<string, vscode.Terminal>;
    closeTerminal(name: string): void;
    closeAllTerminals(): void;
}
