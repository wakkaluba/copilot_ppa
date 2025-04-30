import { injectable } from 'inversify';
import * as vscode from 'vscode';
import { ExtensionAccessManager } from './ExtensionAccessManager';

@injectable()
export class ExtensionConfigurationManager {
    constructor(private readonly accessManager: ExtensionAccessManager) {}

    /**
     * Update configuration for a specific extension
     */
    public async updateExtensionConfiguration(
        extensionId: string,
        section: string,
        value: any,
        target: vscode.ConfigurationTarget = vscode.ConfigurationTarget.Global
    ): Promise<void> {
        const extension = await this.accessManager.getExtension(extensionId);
        if (!extension) {
            return;
        }

        const extensionConfig = vscode.workspace.getConfiguration(section);
        const response = await vscode.window.showInformationMessage(
            `Allow changing configuration '${section}' for ${extension.packageJSON.displayName || extensionId}?`,
            { modal: true },
            'Allow',
            'Deny'
        );

        if (response === 'Allow') {
            await extensionConfig.update(section, value, target);
        }
    }

    /**
     * Get configuration for a specific extension
     */
    public async getExtensionConfiguration(extensionId: string, section: string): Promise<any> {
        const extension = await this.accessManager.getExtension(extensionId);
        if (!extension) {
            return undefined;
        }

        const config = vscode.workspace.getConfiguration(section);
        return config.get(section);
    }

    /**
     * List configurable sections for an extension
     */
    public async getConfigurableSections(extensionId: string): Promise<string[]> {
        const extension = await this.accessManager.getExtension(extensionId);
        if (!extension) {
            return [];
        }

        const pkg = extension.packageJSON;
        if (!pkg.contributes?.configuration) {
            return [];
        }

        const sections = Array.isArray(pkg.contributes.configuration)
            ? pkg.contributes.configuration
            : [pkg.contributes.configuration];

        return sections.map(config => config.title || config.properties ? Object.keys(config.properties)[0] : '');
    }
}
