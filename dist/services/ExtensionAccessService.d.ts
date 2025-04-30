import * as vscode from 'vscode';
interface ExtensionAccess {
    extensionId: string;
    permissions: ExtensionPermission[];
    allowed: boolean;
    lastAccessed?: number;
}
interface ExtensionPermission {
    name: string;
    description: string;
    granted: boolean;
}
export declare class ExtensionAccessService implements vscode.Disposable {
    private readonly context;
    private readonly onPermissionChangedEmitter;
    readonly onPermissionChanged: any;
    private readonly extensionAccess;
    private readonly storageKey;
    constructor(context: vscode.ExtensionContext);
    private loadPermissions;
    private savePermissions;
    requestAccess(extensionId: string, permissions: string[]): Promise<boolean>;
    hasPermission(extensionId: string, permission: string): boolean;
    revokeAccess(extensionId: string): void;
    listExtensionAccess(): ExtensionAccess[];
    private getPermissionDescription;
    dispose(): void;
}
export {};
