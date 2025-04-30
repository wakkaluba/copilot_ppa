import { injectable } from 'inversify';
import * as vscode from 'vscode';

@injectable()
export class ExtensionValidationService {
    /**
     * Check if an extension is safe to access based on its manifest
     */
    public validateExtensionAccess(extension: vscode.Extension<any>): boolean {
        // Check if the extension is built-in
        if (extension.id.startsWith('vscode.')) {
            return true;
        }

        // Check manifest for required properties
        const manifest = extension.packageJSON;
        if (!manifest) {
            return false;
        }

        // Check for required fields
        if (!manifest.name || !manifest.publisher || !manifest.version) {
            return false;
        }

        // Validate extension capabilities
        const capabilities = manifest.capabilities || {};
        const untrustedWorkspaces = capabilities.untrustedWorkspaces || {};

        // If the extension explicitly states it's not supported in untrusted workspaces, we should be careful
        if (untrustedWorkspaces.supported === false) {
            return false;
        }

        return true;
    }

    /**
     * Check if a configuration change is safe
     */
    public validateConfigurationChange(
        extension: vscode.Extension<any>,
        section: string,
        value: any
    ): { isValid: boolean; reason?: string } {
        const manifest = extension.packageJSON;

        // Check if the configuration section exists in the extension's manifest
        const configuration = manifest.contributes?.configuration;
        if (!configuration) {
            return { isValid: false, reason: 'Extension does not declare any configuration' };
        }

        // Find the configuration property
        const properties = Array.isArray(configuration)
            ? configuration.flatMap(c => Object.entries(c.properties || {}))
            : Object.entries(configuration.properties || {});

        const property = properties.find(([key]) => key === section);
        if (!property) {
            return { isValid: false, reason: `Configuration section "${section}" not found` };
        }

        // Validate value against property schema
        const [, schema] = property;
        if (!this.validateValueAgainstSchema(value, schema)) {
            return { isValid: false, reason: `Invalid value for "${section}"` };
        }

        return { isValid: true };
    }

    /**
     * Validate extension installation
     */
    public async validateExtensionInstallation(extensionId: string): Promise<{ isValid: boolean; reason?: string }> {
        try {
            // Check if extension exists in marketplace
            const extension = await vscode.commands.executeCommand('workbench.extensions.search', extensionId);
            if (!extension || !Array.isArray(extension) || extension.length === 0) {
                return { isValid: false, reason: 'Extension not found in marketplace' };
            }

            // Check if extension is already installed
            const installed = vscode.extensions.getExtension(extensionId);
            if (installed) {
                return { isValid: false, reason: 'Extension is already installed' };
            }

            return { isValid: true };
        } catch (error) {
            return {
                isValid: false,
                reason: `Failed to validate extension: ${error instanceof Error ? error.message : String(error)}`
            };
        }
    }

    private validateValueAgainstSchema(value: any, schema: any): boolean {
        if (!schema) {
            return true;  // No schema to validate against
        }

        switch (schema.type) {
            case 'string':
                return typeof value === 'string';
            case 'number':
                return typeof value === 'number';
            case 'boolean':
                return typeof value === 'boolean';
            case 'array':
                return Array.isArray(value) && (!schema.items ||
                    value.every(item => this.validateValueAgainstSchema(item, schema.items)));
            case 'object':
                return typeof value === 'object' && value !== null;
            default:
                return true;  // Unknown type, assume valid
        }
    }
}
