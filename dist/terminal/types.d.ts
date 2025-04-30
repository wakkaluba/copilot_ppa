/**
 * Supported shell types for terminals
 */
export declare enum TerminalShellType {
    VSCodeDefault = "vscode-default",
    PowerShell = "powershell",
    GitBash = "git-bash",
    WSLBash = "wsl-bash"
}
/**
 * Command execution result
 */
export interface CommandResult {
    stdout: string;
    stderr: string;
    exitCode: number;
    success: boolean;
}
/**
 * Command history entry
 */
export interface CommandHistoryEntry {
    command: string;
    timestamp: Date;
    shellType: TerminalShellType;
    result?: CommandResult;
}
/**
 * Terminal session information
 */
export interface TerminalSession {
    id: string;
    name: string;
    shellType: TerminalShellType;
    createdAt: Date;
    commandHistory: CommandHistoryEntry[];
}
export interface CommandGenerationResult {
    command: string;
    explanation?: string;
    isValid: boolean;
}
export interface CommandAnalysis {
    command: string;
    analysis: string;
    riskLevel?: 'low' | 'medium' | 'high';
    safeToExecute: boolean;
}
