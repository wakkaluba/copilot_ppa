import * as vscode from 'vscode';
import { TerminalShellType } from './types';
import { ShellService } from './services/ShellService';
import { CommandExecutorService } from './services/CommandExecutorService';
import { TerminalLifecycleService } from './services/TerminalLifecycleService';

export class TerminalManager {
    private readonly shellService: ShellService;
    private readonly commandExecutor: CommandExecutorService;
    private readonly lifecycleService: TerminalLifecycleService;

    constructor() {
        this.shellService = new ShellService();
        this.commandExecutor = new CommandExecutorService();
        this.lifecycleService = new TerminalLifecycleService();
        
        vscode.window.onDidCloseTerminal(terminal => {
            this.lifecycleService.handleTerminalClose(terminal);
        });
    }

    public createTerminal(name: string, shellType: TerminalShellType): vscode.Terminal {
        const options: vscode.TerminalOptions = {
            name,
            shellPath: this.shellService.getShellPath(shellType),
            shellArgs: this.shellService.getShellArgs(shellType),
            cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
        };

        return this.lifecycleService.createTerminal(name, options);
    }

    public showTerminal(name: string, shellType: TerminalShellType): void {
        this.lifecycleService.showTerminal(name, () => this.createTerminal(name, shellType));
    }

    public async executeCommand(command: string, terminalName?: string): Promise<void> {
        const terminal = this.lifecycleService.getTerminal(terminalName);
        await this.commandExecutor.executeInTerminal(terminal, command);
    }

    public async executeCommandWithOutput(
        command: string, 
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault
    ): Promise<string> {
        return this.commandExecutor.executeWithOutput(command, shellType);
    }

    public getActiveTerminals(): Map<string, vscode.Terminal> {
        return this.lifecycleService.getActiveTerminals();
    }

    public closeTerminal(name: string): void {
        this.lifecycleService.closeTerminal(name);
    }

    public closeAllTerminals(): void {
        this.lifecycleService.closeAllTerminals();
    }
}
