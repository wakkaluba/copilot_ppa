import { inject, injectable } from 'inversify';
import * as vscode from 'vscode';
import { ExtensionAccessManager } from '../services/ExtensionAccessManager';
import { ExtensionConfigurationManager } from '../services/ExtensionConfigurationManager';
import { ExtensionInstallationManager } from '../services/ExtensionInstallationManager';

@injectable()
export class ExtensionManagementCommands {
    constructor(
        @inject(ExtensionAccessManager) private readonly accessManager: ExtensionAccessManager,
        @inject(ExtensionConfigurationManager) private readonly configManager: ExtensionConfigurationManager,
        @inject(ExtensionInstallationManager) private readonly installManager: ExtensionInstallationManager
    ) {}

    public registerCommands(context: vscode.ExtensionContext): void {
        // Extension access commands
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.requestExtensionAccess', async () => {
                const extensionId = await vscode.window.showInputBox({
                    prompt: 'Enter the extension ID to request access',
                    placeHolder: 'publisher.extension-name'
                });

                if (extensionId) {
                    await this.accessManager.requestExtensionAccess(extensionId);
                }
            })
        );

        // Extension configuration commands
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
                    const sections = await this.configManager.getConfigurableSections(extensionId.description);
                    const section = await vscode.window.showQuickPick(sections, {
                        placeHolder: 'Select configuration section'
                    });

                    if (section) {
                        const currentValue = await this.configManager.getExtensionConfiguration(extensionId.description, section);
                        const value = await vscode.window.showInputBox({
                            prompt: `Enter new value for ${section}`,
                            value: JSON.stringify(currentValue)
                        });

                        if (value) {
                            try {
                                const parsedValue = JSON.parse(value);
                                await this.configManager.updateExtensionConfiguration(extensionId.description, section, parsedValue);
                            } catch (error) {
                                vscode.window.showErrorMessage('Invalid JSON value');
                            }
                        }
                    }
                }
            })
        );

        // Extension installation commands
        context.subscriptions.push(
            vscode.commands.registerCommand('copilot-ppa.showRecommendedExtensions', async () => {
                const recommendations = await this.installManager.getRecommendedExtensions();
                const selected = await vscode.window.showQuickPick(
                    recommendations.map(rec => ({
                        label: rec.id,
                        description: rec.reason,
                        recommendation: rec
                    })),
                    {
                        placeHolder: 'Select extension to install',
                        canPickMany: true
                    }
                );

                if (selected) {
                    for (const item of selected) {
                        await this.installManager.installExtension(item.label);
                    }
                }
            })
        );
    }
}
