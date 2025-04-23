import * as vscode from 'vscode';
import { injectable } from 'inversify';
import { TerminalShellType } from '../types';

@injectable()
export class TerminalConfigurationService {
    getAvailableShells(): { label: string; value: TerminalShellType }[] {
        const shells = [
            { label: 'Default VS Code Terminal', value: TerminalShellType.VSCodeDefault },
            { label: 'PowerShell', value: TerminalShellType.PowerShell },
            { label: 'Git Bash', value: TerminalShellType.GitBash }
        ];
        
        if (process.platform === 'win32') {
            shells.push({ label: 'WSL Bash', value: TerminalShellType.WSLBash });
        }
        
        return shells;
    }

    async selectShellType(): Promise<TerminalShellType | undefined> {
        const shells = this.getAvailableShells();
        const selected = await vscode.window.showQuickPick(shells, {
            placeHolder: 'Select shell type'
        });
        return selected?.value;
    }
}
