import * as vscode from 'vscode';
import * as os from 'os';
import * as path from 'path';
import { TerminalShellType } from './types';
import { CommandGenerationResult, CommandAnalysis } from './types';

/**
 * Manages terminal instances and operations within VSCode
 */
export class TerminalManager {
    private terminals: Map<string, vscode.Terminal> = new Map();
    private outputChannels: Map<string, vscode.OutputChannel> = new Map();
    private lastActiveTerminal: string | null = null;

    constructor() {
        // Listen for terminal close events to clean up references
        vscode.window.onDidCloseTerminal(terminal => {
            for (const [name, term] of this.terminals.entries()) {
                if (term === terminal) {
                    this.terminals.delete(name);
                    break;
                }
            }
        });
    }

    /**
     * Creates a new terminal with the specified shell type
     * @param name Name for the terminal
     * @param shellType Type of shell to use
     * @returns The created terminal
     */
    public createTerminal(name: string, shellType: TerminalShellType): vscode.Terminal {
        // Check if terminal with this name already exists
        if (this.terminals.has(name)) {
            // Return existing terminal
            return this.terminals.get(name)!;
        }

        const options: vscode.TerminalOptions = {
            name,
            shellPath: this.getShellPath(shellType),
            shellArgs: this.getShellArgs(shellType),
            cwd: vscode.workspace.workspaceFolders?.[0].uri.fsPath
        };

        const terminal = vscode.window.createTerminal(options);
        this.terminals.set(name, terminal);
        this.lastActiveTerminal = name;
        return terminal;
    }

    /**
     * Shows the terminal with the given name. Creates it if it doesn't exist.
     * @param name Name of the terminal
     * @param shellType Shell type to use if creating a new terminal
     */
    public showTerminal(name: string, shellType: TerminalShellType): void {
        let terminal: vscode.Terminal;
        
        if (this.terminals.has(name)) {
            terminal = this.terminals.get(name)!;
        } else {
            terminal = this.createTerminal(name, shellType);
        }
        
        terminal.show();
        this.lastActiveTerminal = name;
    }

    /**
     * Executes a command in the specified terminal
     * @param command Command to execute
     * @param terminalName Terminal to use, or null for the last active terminal
     * @returns Promise that resolves when the command is sent
     */
    public async executeCommand(command: string, terminalName?: string): Promise<void> {
        const name = terminalName || this.lastActiveTerminal;
        if (!name || !this.terminals.has(name)) {
            throw new Error('No active terminal available');
        }

        const terminal = this.terminals.get(name)!;
        terminal.show();
        
        // Send the command to the terminal
        terminal.sendText(command);
    }

    /**
     * Executes a command and captures the output
     * @param command Command to execute
     * @param shellType Shell type to use
     * @returns Promise that resolves with the command output
     */
    public async executeCommandWithOutput(
        command: string, 
        shellType: TerminalShellType = TerminalShellType.VSCodeDefault
    ): Promise<string> {
        // For capturing output, we'll use Node.js child_process
        // This is implemented in the CommandExecutor class
        const executor = new CommandExecutor();
        return executor.executeCommand(command, shellType);
    }

    /**
     * Gets all active terminals managed by this class
     */
    public getActiveTerminals(): Map<string, vscode.Terminal> {
        return new Map(this.terminals);
    }

    /**
     * Closes the specified terminal
     * @param name Name of the terminal to close
     */
    public closeTerminal(name: string): void {
        if (this.terminals.has(name)) {
            const terminal = this.terminals.get(name)!;
            terminal.dispose();
            this.terminals.delete(name);
            
            if (this.lastActiveTerminal === name) {
                this.lastActiveTerminal = null;
            }
        }
    }

    /**
     * Closes all terminals managed by this class
     */
    public closeAllTerminals(): void {
        for (const terminal of this.terminals.values()) {
            terminal.dispose();
        }
        
        this.terminals.clear();
        this.lastActiveTerminal = null;
    }

    /**
     * Returns the path to the shell executable based on the shell type
     */
    private getShellPath(shellType: TerminalShellType): string | undefined {
        const platform = os.platform();

        switch (shellType) {
            case TerminalShellType.PowerShell:
                if (platform === 'win32') {
                    // Try to find PowerShell Core first, fall back to Windows PowerShell
                    const pwshPaths = [
                        'C:\\Program Files\\PowerShell\\7\\pwsh.exe',
                        'C:\\Program Files\\PowerShell\\6\\pwsh.exe',
                        'C:\\Windows\\System32\\WindowsPowerShell\\v1.0\\powershell.exe'
                    ];
                    
                    for (const pwshPath of pwshPaths) {
                        try {
                            if (require('fs').existsSync(pwshPath)) {
                                return pwshPath;
                            }
                        } catch (e) {
                            // Ignore errors
                        }
                    }
                    
                    return 'powershell.exe';
                } else {
                    return 'pwsh';
                }
                
            case TerminalShellType.GitBash:
                if (platform === 'win32') {
                    const gitPaths = [
                        'C:\\Program Files\\Git\\bin\\bash.exe',
                        'C:\\Program Files (x86)\\Git\\bin\\bash.exe'
                    ];
                    
                    for (const gitPath of gitPaths) {
                        try {
                            if (require('fs').existsSync(gitPath)) {
                                return gitPath;
                            }
                        } catch (e) {
                            // Ignore errors
                        }
                    }
                }
                return undefined; // Fall back to default shell

            case TerminalShellType.WSLBash:
                if (platform === 'win32') {
                    return 'wsl.exe';
                }
                return undefined; // Not applicable on non-Windows platforms

            case TerminalShellType.VSCodeDefault:
            default:
                return undefined; // Use VS Code's default shell
        }
    }

    /**
     * Returns the shell arguments based on the shell type
     */
    private getShellArgs(shellType: TerminalShellType): string[] | undefined {
        switch (shellType) {
            case TerminalShellType.PowerShell:
                return ['-NoExit', '-Command', 'Set-Location -Path "$env:USERPROFILE"'];
                
            case TerminalShellType.GitBash:
                return ['--login', '-i'];
                
            case TerminalShellType.WSLBash:
                return ['--distribution', 'Ubuntu'];
                
            case TerminalShellType.VSCodeDefault:
            default:
                return undefined;
        }
    }
}

/**
 * Helper class to execute commands and capture their output
 */
class CommandExecutor {
    /**
     * Executes a command and returns its output
     * @param command Command to execute
     * @param shellType Shell type to use
     * @returns Promise that resolves with the command output
     */
    public async executeCommand(command: string, shellType: TerminalShellType): Promise<string> {
        const { spawn } = require('child_process');
        const shellInfo = this.getShellInfo(shellType);
        
        return new Promise<string>((resolve, reject) => {
            try {
                const process = spawn(
                    shellInfo.shellPath,
                    [...shellInfo.shellArgs, command],
                    { shell: true }
                );
                
                let stdout = '';
                let stderr = '';
                
                process.stdout.on('data', (data: Buffer) => {
                    stdout += data.toString();
                });
                
                process.stderr.on('data', (data: Buffer) => {
                    stderr += data.toString();
                });
                
                process.on('close', (code: number) => {
                    if (code === 0) {
                        resolve(stdout);
                    } else {
                        reject(new Error(`Command failed with code ${code}: ${stderr}`));
                    }
                });
                
                process.on('error', (err: Error) => {
                    reject(err);
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    /**
     * Gets the shell executable and arguments based on shell type
     */
    private getShellInfo(shellType: TerminalShellType): { shellPath: string, shellArgs: string[] } {
        const platform = os.platform();
        
        switch (shellType) {
            case TerminalShellType.PowerShell:
                if (platform === 'win32') {
                    return {
                        shellPath: 'powershell.exe',
                        shellArgs: ['-Command']
                    };
                } else {
                    return {
                        shellPath: 'pwsh',
                        shellArgs: ['-Command']
                    };
                }
                
            case TerminalShellType.GitBash:
                if (platform === 'win32') {
                    return {
                        shellPath: 'C:\\Program Files\\Git\\bin\\bash.exe',
                        shellArgs: ['-c']
                    };
                } else {
                    return {
                        shellPath: '/bin/bash',
                        shellArgs: ['-c']
                    };
                }
                
            case TerminalShellType.WSLBash:
                if (platform === 'win32') {
                    return {
                        shellPath: 'wsl.exe',
                        shellArgs: ['bash', '-c']
                    };
                } else {
                    return {
                        shellPath: '/bin/bash',
                        shellArgs: ['-c']
                    };
                }
                
            case TerminalShellType.VSCodeDefault:
            default:
                if (platform === 'win32') {
                    return {
                        shellPath: 'cmd.exe',
                        shellArgs: ['/c']
                    };
                } else {
                    return {
                        shellPath: '/bin/bash',
                        shellArgs: ['-c']
                    };
                }
        }
    }
}
