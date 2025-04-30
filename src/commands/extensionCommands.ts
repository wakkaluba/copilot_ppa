import * as vscode from 'vscode';
import { ExtensionManager } from '../services/ExtensionManager';

export function registerExtensionCommands(context: vscode.ExtensionContext): void {
    const extensionManager = ExtensionManager.getInstance();

    context.subscriptions.push(
        vscode.commands.registerCommand('copilot-ppa.listExtensions', async () => {
            const extensions = await extensionManager.listExtensions();
            const items = extensions.map(ext => ({
                label: ext.packageJSON.displayName || ext.id,
                description: ext.id,
                extension: ext
            }));

            const selected = await vscode.window.showQuickPick(items, {
                placeHolder: 'Select an extension to manage',
                matchOnDescription: true
            });

            if (selected) {
                const action = await vscode.window.showQuickPick([
                    { label: 'Toggle Enable/Disable', action: 'toggle' },
                    { label: 'Request Access', action: 'access' },
                    { label: 'View Details', action: 'details' }
                ], {
                    placeHolder: 'Choose an action'
                });

                if (action) {
                    switch (action.action) {
                        case 'toggle':
                            await extensionManager.toggleExtension(selected.extension.id);
                            break;
                        case 'access':
                            await extensionManager.getExtension(selected.extension.id);
                            break;
                        case 'details':
                            await vscode.commands.executeCommand('workbench.extensions.action.showExtensionsWithIds', [selected.extension.id]);
                            break;
                    }
                }
            }
        }),

        vscode.commands.registerCommand('copilot-ppa.clearExtensionPermissions', () => {
            extensionManager.clearPermissions();
            vscode.window.showInformationMessage('Extension permissions have been cleared');
        })
    );
}
