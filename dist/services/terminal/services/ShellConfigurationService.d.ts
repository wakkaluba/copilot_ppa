import * as vscode from 'vscode';
import { TerminalShellType } from '../types';
export declare class ShellConfigurationService {
    private maxHistorySize;
    getHistoryLimit(): number;
    getShellConfig(shellType: TerminalShellType): vscode.ShellConfiguration;
}
