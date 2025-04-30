import * as vscode from 'vscode';
export declare class ExtensionAPI implements vscode.Disposable {
    private readonly accessService;
    constructor(context: vscode.ExtensionContext);
    executeCommand(extensionId: string, command: string, ...args: any[]): Promise<any>;
    readConfiguration<T>(extensionId: string, section: string): Promise<T | undefined>;
    updateConfiguration(extensionId: string, section: string, value: any): Promise<void>;
    accessDebugFeatures(extensionId: string): Promise<vscode.Debug>;
    private ensurePermission;
    registerAPIProvider(): void;
    dispose(): void;
}
