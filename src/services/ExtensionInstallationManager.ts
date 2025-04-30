import { injectable } from 'inversify';
import * as vscode from 'vscode';

@injectable()
export class ExtensionInstallationManager {
    /**
     * Install an extension with user confirmation
     */
    public async installExtension(extensionId: string): Promise<void> {
        const response = await vscode.window.showInformationMessage(
            `Allow installation of extension: ${extensionId}?`,
            { modal: true },
            'Install',
            'Cancel'
        );

        if (response === 'Install') {
            try {
                await vscode.commands.executeCommand('workbench.extensions.installExtension', extensionId);
                vscode.window.showInformationMessage(`Successfully installed extension: ${extensionId}`);
            } catch (error) {
                vscode.window.showErrorMessage(`Failed to install extension: ${error instanceof Error ? error.message : String(error)}`);
            }
        }
    }

    /**
     * Get recommended extensions based on workspace content
     */
    public async getRecommendedExtensions(): Promise<{ id: string; reason: string }[]> {
        const recommendations: { id: string; reason: string }[] = [];
        const files = await vscode.workspace.findFiles('**/*');

        // Build recommendations based on file types
        for (const file of files) {
            const ext = file.fsPath.split('.').pop()?.toLowerCase();
            switch (ext) {
                case 'py':
                    recommendations.push({
                        id: 'ms-python.python',
                        reason: 'Python files detected in workspace'
                    });
                    break;
                case 'java':
                    recommendations.push({
                        id: 'redhat.java',
                        reason: 'Java files detected in workspace'
                    });
                    break;
                case 'ts':
                case 'tsx':
                    recommendations.push({
                        id: 'dbaeumer.vscode-eslint',
                        reason: 'TypeScript files detected in workspace'
                    });
                    break;
                // Add more extension recommendations based on file types
            }
        }

        // Remove duplicates
        return Array.from(new Map(recommendations.map(item => [item.id, item])).values());
    }
}
