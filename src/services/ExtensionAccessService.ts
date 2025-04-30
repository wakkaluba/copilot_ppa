import * as vscode from 'vscode';
import { EventEmitter } from 'events';

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

export class ExtensionAccessService implements vscode.Disposable {
    private readonly onPermissionChangedEmitter = new EventEmitter<{ extensionId: string, permission: string, granted: boolean }>();
    readonly onPermissionChanged = this.onPermissionChangedEmitter.event;

    private readonly extensionAccess = new Map<string, ExtensionAccess>();
    private readonly storageKey = 'extensionAccessPermissions';

    constructor(private readonly context: vscode.ExtensionContext) {
        this.loadPermissions();
    }

    private loadPermissions(): void {
        const stored = this.context.globalState.get<{ [key: string]: ExtensionAccess }>(this.storageKey, {});
        Object.entries(stored).forEach(([id, access]) => {
            this.extensionAccess.set(id, access);
        });
    }

    private async savePermissions(): Promise<void> {
        const permissions = Object.fromEntries(this.extensionAccess.entries());
        await this.context.globalState.update(this.storageKey, permissions);
    }

    async requestAccess(extensionId: string, permissions: string[]): Promise<boolean> {
        const extension = vscode.extensions.getExtension(extensionId);
        if (!extension) {
            throw new Error(`Extension ${extensionId} not found`);
        }

        let access = this.extensionAccess.get(extensionId);
        if (!access) {
            access = {
                extensionId,
                permissions: permissions.map(name => ({
                    name,
                    description: this.getPermissionDescription(name),
                    granted: false
                })),
                allowed: false
            };
            this.extensionAccess.set(extensionId, access);
        }

        // Ask user for permission
        const response = await vscode.window.showInformationMessage(
            `Extension "${extension.packageJSON.displayName}" requests the following permissions:\n` +
            permissions.map(p => `- ${this.getPermissionDescription(p)}`).join('\n'),
            { modal: true },
            'Allow',
            'Deny'
        );

        const granted = response === 'Allow';
        access.allowed = granted;
        access.permissions.forEach(p => {
            if (permissions.includes(p.name)) {
                p.granted = granted;
                this.onPermissionChangedEmitter.emit('permissionChanged', {
                    extensionId,
                    permission: p.name,
                    granted
                });
            }
        });
        access.lastAccessed = Date.now();

        await this.savePermissions();
        return granted;
    }

    hasPermission(extensionId: string, permission: string): boolean {
        const access = this.extensionAccess.get(extensionId);
        if (!access || !access.allowed) {
            return false;
        }

        const permissionObj = access.permissions.find(p => p.name === permission);
        return permissionObj?.granted ?? false;
    }

    revokeAccess(extensionId: string): void {
        const access = this.extensionAccess.get(extensionId);
        if (access) {
            access.allowed = false;
            access.permissions.forEach(p => {
                p.granted = false;
                this.onPermissionChangedEmitter.emit('permissionChanged', {
                    extensionId,
                    permission: p.name,
                    granted: false
                });
            });
            this.savePermissions();
        }
    }

    listExtensionAccess(): ExtensionAccess[] {
        return Array.from(this.extensionAccess.values());
    }

    private getPermissionDescription(permission: string): string {
        const descriptions: { [key: string]: string } = {
            'read': 'Read extension data and settings',
            'write': 'Modify extension settings',
            'execute': 'Execute extension commands',
            'debug': 'Access extension debug features'
        };
        return descriptions[permission] || permission;
    }

    dispose(): void {
        this.onPermissionChangedEmitter.removeAllListeners();
    }
}