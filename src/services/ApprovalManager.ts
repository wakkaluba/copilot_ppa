import * as vscode from 'vscode';
import { WorkspaceManager } from './WorkspaceManager';
import { TrustManager } from './TrustManager';

export interface ChangePreview {
    filePath: string;
    originalContent: string;
    newContent: string;
    type: 'create' | 'modify' | 'delete';
}

export class ApprovalManager {
    private static instance: ApprovalManager;
    private workspaceManager: WorkspaceManager;
    private trustManager: TrustManager;

    private constructor() {
        this.workspaceManager = WorkspaceManager.getInstance();
        this.trustManager = TrustManager.getInstance();
    }

    static getInstance(): ApprovalManager {
        if (!this.instance) {
            this.instance = new ApprovalManager();
        }
        return this.instance;
    }

    async requestApproval(changes: ChangePreview[]): Promise<boolean> {
        // Check workspace trust first
        for (const change of changes) {
            if (!await this.trustManager.requireTrust(change.filePath)) {
                return false;
            }
        }

        const previewResult = await this.showChangePreview(changes);
        if (!previewResult) {return false;}

        return await this.showConfirmationDialog(changes);
    }

    private async showChangePreview(changes: ChangePreview[]): Promise<boolean> {
        for (const change of changes) {
            const diff = await this.createDiffView(change);
            const choice = await vscode.window.showInformationMessage(
                `Preview changes for ${change.filePath}?`,
                'Show Preview',
                'Skip',
                'Cancel'
            );

            if (choice === 'Cancel') {return false;}
            if (choice === 'Show Preview') {
                await vscode.commands.executeCommand('vscode.diff',
                    this.createTempUri(change.filePath, 'original'),
                    this.createTempUri(change.filePath, 'modified'),
                    `${change.filePath} (Preview)`
                );
            }
        }
        return true;
    }

    private async showConfirmationDialog(changes: ChangePreview[]): Promise<boolean> {
        const message = this.createConfirmationMessage(changes);
        const choice = await vscode.window.showWarningMessage(
            message,
            { modal: true },
            'Apply Changes',
            'Cancel'
        );
        return choice === 'Apply Changes';
    }

    private createConfirmationMessage(changes: ChangePreview[]): string {
        const summary = changes.reduce(
            (acc, change) => {
                acc[change.type]++;
                return acc;
            },
            { create: 0, modify: 0, delete: 0 }
        );

        return `The following changes will be applied:
• ${summary.create} files to create
• ${summary.modify} files to modify
• ${summary.delete} files to delete

Do you want to proceed?`;
    }

    private createTempUri(filePath: string, type: 'original' | 'modified'): vscode.Uri {
        return vscode.Uri.parse(`untitled:${filePath}.${type}`);
    }

    private async createDiffView(change: ChangePreview): Promise<void> {
        // Implementation for diff view creation
        // This would be used by the preview system
    }
}
