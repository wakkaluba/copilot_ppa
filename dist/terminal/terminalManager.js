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
exports.TerminalManager = void 0;
const vscode = __importStar(require("vscode"));
const os = __importStar(require("os"));
const types_1 = require("./types");
/**
 * Manages terminal instances and operations within VSCode
 */
class TerminalManager {
    terminals = new Map();
    outputChannels = new Map();
    lastActiveTerminal = null;
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
    createTerminal(name, shellType) {
        // Check if terminal with this name already exists
        if (this.terminals.has(name)) {
            // Return existing terminal
            return this.terminals.get(name);
        }
        const options = {
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
    showTerminal(name, shellType) {
        let terminal;
        if (this.terminals.has(name)) {
            terminal = this.terminals.get(name);
        }
        else {
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
    async executeCommand(command, terminalName) {
        const name = terminalName || this.lastActiveTerminal;
        if (!name || !this.terminals.has(name)) {
            throw new Error('No active terminal available');
        }
        const terminal = this.terminals.get(name);
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
    async executeCommandWithOutput(command, shellType = types_1.TerminalShellType.VSCodeDefault) {
        // For capturing output, we'll use Node.js child_process
        // This is implemented in the CommandExecutor class
        const executor = new CommandExecutor();
        return executor.executeCommand(command, shellType);
    }
    /**
     * Gets all active terminals managed by this class
     */
    getActiveTerminals() {
        return new Map(this.terminals);
    }
    /**
     * Closes the specified terminal
     * @param name Name of the terminal to close
     */
    closeTerminal(name) {
        if (this.terminals.has(name)) {
            const terminal = this.terminals.get(name);
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
    closeAllTerminals() {
        for (const terminal of this.terminals.values()) {
            terminal.dispose();
        }
        this.terminals.clear();
        this.lastActiveTerminal = null;
    }
    /**
     * Returns the path to the shell executable based on the shell type
     */
    getShellPath(shellType) {
        const platform = os.platform();
        switch (shellType) {
            case types_1.TerminalShellType.PowerShell:
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
                        }
                        catch (e) {
                            // Ignore errors
                        }
                    }
                    return 'powershell.exe';
                }
                else {
                    return 'pwsh';
                }
            case types_1.TerminalShellType.GitBash:
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
                        }
                        catch (e) {
                            // Ignore errors
                        }
                    }
                }
                return undefined; // Fall back to default shell
            case types_1.TerminalShellType.WSLBash:
                if (platform === 'win32') {
                    return 'wsl.exe';
                }
                return undefined; // Not applicable on non-Windows platforms
            case types_1.TerminalShellType.VSCodeDefault:
            default:
                return undefined; // Use VS Code's default shell
        }
    }
    /**
     * Returns the shell arguments based on the shell type
     */
    getShellArgs(shellType) {
        switch (shellType) {
            case types_1.TerminalShellType.PowerShell:
                return ['-NoExit', '-Command', 'Set-Location -Path "$env:USERPROFILE"'];
            case types_1.TerminalShellType.GitBash:
                return ['--login', '-i'];
            case types_1.TerminalShellType.WSLBash:
                return ['--distribution', 'Ubuntu'];
            case types_1.TerminalShellType.VSCodeDefault:
            default:
                return undefined;
        }
    }
}
exports.TerminalManager = TerminalManager;
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
    async executeCommand(command, shellType) {
        const { spawn } = require('child_process');
        const shellInfo = this.getShellInfo(shellType);
        return new Promise((resolve, reject) => {
            try {
                const process = spawn(shellInfo.shellPath, [...shellInfo.shellArgs, command], { shell: true });
                let stdout = '';
                let stderr = '';
                process.stdout.on('data', (data) => {
                    stdout += data.toString();
                });
                process.stderr.on('data', (data) => {
                    stderr += data.toString();
                });
                process.on('close', (code) => {
                    if (code === 0) {
                        resolve(stdout);
                    }
                    else {
                        reject(new Error(`Command failed with code ${code}: ${stderr}`));
                    }
                });
                process.on('error', (err) => {
                    reject(err);
                });
            }
            catch (error) {
                reject(error);
            }
        });
    }
    /**
     * Gets the shell executable and arguments based on shell type
     */
    getShellInfo(shellType) {
        const platform = os.platform();
        switch (shellType) {
            case types_1.TerminalShellType.PowerShell:
                if (platform === 'win32') {
                    return {
                        shellPath: 'powershell.exe',
                        shellArgs: ['-Command']
                    };
                }
                else {
                    return {
                        shellPath: 'pwsh',
                        shellArgs: ['-Command']
                    };
                }
            case types_1.TerminalShellType.GitBash:
                if (platform === 'win32') {
                    return {
                        shellPath: 'C:\\Program Files\\Git\\bin\\bash.exe',
                        shellArgs: ['-c']
                    };
                }
                else {
                    return {
                        shellPath: '/bin/bash',
                        shellArgs: ['-c']
                    };
                }
            case types_1.TerminalShellType.WSLBash:
                if (platform === 'win32') {
                    return {
                        shellPath: 'wsl.exe',
                        shellArgs: ['bash', '-c']
                    };
                }
                else {
                    return {
                        shellPath: '/bin/bash',
                        shellArgs: ['-c']
                    };
                }
            case types_1.TerminalShellType.VSCodeDefault:
            default:
                if (platform === 'win32') {
                    return {
                        shellPath: 'cmd.exe',
                        shellArgs: ['/c']
                    };
                }
                else {
                    return {
                        shellPath: '/bin/bash',
                        shellArgs: ['-c']
                    };
                }
        }
    }
}
//# sourceMappingURL=terminalManager.js.map