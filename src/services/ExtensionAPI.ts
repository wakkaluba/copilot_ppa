import * as vscode from 'vscode';
import { ExtensionAccessService } from './ExtensionAccessService';

export class ExtensionAPI implements vscode.Disposable {
    private readonly accessService: ExtensionAccessService;

    constructor(context: vscode.ExtensionContext) {
        this.accessService = new ExtensionAccessService(context);
    }

    async executeCommand(extensionId: string, command: string, ...args: any[]): Promise<any> {
        if (!await this.ensurePermission(extensionId, 'execute')) {
            throw new Error('Permission denied: execute');
        }

        return vscode.commands.executeCommand(command, ...args);
    }

    async readConfiguration<T>(extensionId: string, section: string): Promise<T | undefined> {
        if (!await this.ensurePermission(extensionId, 'read')) {
            throw new Error('Permission denied: read');
        }

        return vscode.workspace.getConfiguration(section).get<T>(section);
    }

    async updateConfiguration(extensionId: string, section: string, value: any): Promise<void> {
        if (!await this.ensurePermission(extensionId, 'write')) {
            throw new Error('Permission denied: write');
        }

        await vscode.workspace.getConfiguration().update(section, value, vscode.ConfigurationTarget.Global);
    }

    async accessDebugFeatures(extensionId: string): Promise<vscode.Debug> {
        if (!await this.ensurePermission(extensionId, 'debug')) {
            throw new Error('Permission denied: debug');
        }

        return vscode.debug;
    }

    private async ensurePermission(extensionId: string, permission: string): Promise<boolean> {
        if (this.accessService.hasPermission(extensionId, permission)) {
            return true;
        }

        return this.accessService.requestAccess(extensionId, [permission]);
    }

    registerAPIProvider(): void {
        // Register the API for other extensions to consume
        return vscode.commands.registerCommand('copilot-ppa.getAPI', () => ({
            executeCommand: this.executeCommand.bind(this),
            readConfiguration: this.readConfiguration.bind(this),
            updateConfiguration: this.updateConfiguration.bind(this),
            accessDebugFeatures: this.accessDebugFeatures.bind(this)
        }));
    }

    dispose(): void {
        this.accessService.dispose();
    }
}