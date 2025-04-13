import * as vscode from 'vscode';

export class TrustManager {
    private static instance: TrustManager;
    private trustedWorkspaces: Set<string> = new Set();

    private constructor() {
        this.initializeTrustState();
    }

    static getInstance(): TrustManager {
        if (!this.instance) {
            this.instance = new TrustManager();
        }
        return this.instance;
    }

    private initializeTrustState(): void {
        if (vscode.workspace.workspaceFolders) {
            for (const folder of vscode.workspace.workspaceFolders) {
                if (folder.uri.scheme === 'file' && vscode.workspace.isTrusted) {
                    this.trustedWorkspaces.add(folder.uri.fsPath);
                }
            }
        }

        vscode.workspace.onDidGrantWorkspaceTrust(() => {
            this.updateTrustState(true);
        });
    }

    private updateTrustState(trusted: boolean): void {
        if (vscode.workspace.workspaceFolders) {
            for (const folder of vscode.workspace.workspaceFolders) {
                if (trusted) {
                    this.trustedWorkspaces.add(folder.uri.fsPath);
                } else {
                    this.trustedWorkspaces.delete(folder.uri.fsPath);
                }
            }
        }
    }

    isPathTrusted(path: string): boolean {
        return this.trustedWorkspaces.has(path) || vscode.workspace.isTrusted;
    }

    // Added method that's used in the tests
    isTrusted(): boolean {
        return vscode.workspace.isTrusted;
    }

    async requireTrust(path: string): Promise<boolean> {
        if (this.isPathTrusted(path)) {
            return true;
        }

        const result = await vscode.window.showWarningMessage(
            'This operation requires workspace trust. Do you want to trust this workspace?',
            { modal: true },
            'Trust Workspace',
            'Cancel'
        );

        if (result === 'Trust Workspace') {
            // The requestWorkspaceTrust() API is not available directly in all VS Code versions
            // Use the command instead which is more broadly supported
            await vscode.commands.executeCommand('workbench.trust.manage');
            return vscode.workspace.isTrusted;
        }

        return false;
    }
}
