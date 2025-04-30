import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { ExtensionManager } from '../services/ExtensionManager';

@injectable()
export class ExtensionCommandRegistrar {
    constructor(
        @inject(ExtensionManager) private readonly manager: ExtensionManager
    ) {}

    public registerCommands(context: vscode.ExtensionContext): void {
        // Request access to an extension
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.requestExtensionAccess', async () => {
                const extensionId = await vscode.window.showInputBox({
                    prompt: 'Enter the extension ID to request access',
                    placeHolder: 'publisher.extension-name'
                });

                if (extensionId) {
                    await this.manager.requestAccess(extensionId);
                }
            })
        );

        // Configure an extension
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.configureExtension', async () => {
                const extensionId = await vscode.window.showQuickPick(
                    vscode.extensions.all.map(ext => ({
                        label: ext.packageJSON.displayName || ext.id,
                        description: ext.id
                    })),
                    { placeHolder: 'Select extension to configure' }
                );

                if (extensionId) {
                    const extension = await this.manager.getExtension(extensionId.description);
                    if (extension) {
                        const config = vscode.workspace.getConfiguration(extension.id);
                        const section = await vscode.window.showInputBox({
                            prompt: 'Enter configuration section',
                            placeHolder: 'e.g., typescript.preferences'
                        });

                        if (section) {
                            const currentValue = config.get(section);
                            const value = await vscode.window.showInputBox({
                                prompt: `Enter new value for ${section}`,
                                value: JSON.stringify(currentValue)
                            });

                            if (value) {
                                try {
                                    const parsedValue = JSON.parse(value);
                                    await this.manager.updateConfiguration(extensionId.description, section, parsedValue);
                                } catch (error) {
                                    vscode.window.showErrorMessage('Invalid JSON value');
                                }
                            }
                        }
                    }
                }
            })
        );

        // Show recommended extensions
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.showRecommendedExtensions', async () => {
                const recommendations = await this.manager.getRecommendations();
                const selected = await vscode.window.showQuickPick(
                    recommendations.map(rec => ({
                        label: rec.id,
                        description: rec.reason
                    })),
                    {
                        placeHolder: 'Select extensions to install',
                        canPickMany: true
                    }
                );

                if (selected) {
                    for (const item of selected) {
                        await this.manager.installRecommendedExtension(item.label);
                    }
                }
            })
        );
    }
}
