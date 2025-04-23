import * as vscode from 'vscode';
import { TerminalShellType } from '../types';
import { injectable } from 'inversify';

@injectable()
export class ShellConfigurationService {
    private maxHistorySize = 100;

    getHistoryLimit(): number {
        return this.maxHistorySize;
    }

    getShellConfig(shellType: TerminalShellType): vscode.ShellConfiguration {
        switch (shellType) {
            case TerminalShellType.PowerShell:
                return {
                    executable: 'powershell.exe',
                    args: ['-NoLogo', '-NoProfile']
                };
            case TerminalShellType.GitBash:
                return {
                    executable: 'bash.exe',
                    args: ['--login', '-i']
                };
            case TerminalShellType.WSLBash:
                return {
                    executable: 'wsl.exe',
                    args: ['bash', '-i']
                };
            default:
                return {
                    executable: undefined,
                    args: []
                };
        }
    }
}
