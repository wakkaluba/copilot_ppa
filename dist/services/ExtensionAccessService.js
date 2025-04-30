"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtensionAccessService = void 0;
const vscode = __importStar(require("vscode"));
const events_1 = require("events");
class ExtensionAccessService {
    context;
    onPermissionChangedEmitter = new events_1.EventEmitter();
    onPermissionChanged = this.onPermissionChangedEmitter.event;
    extensionAccess = new Map();
    storageKey = 'extensionAccessPermissions';
    constructor(context) {
        this.context = context;
        this.loadPermissions();
    }
    loadPermissions() {
        const stored = this.context.globalState.get(this.storageKey, {});
        Object.entries(stored).forEach(([id, access]) => {
            this.extensionAccess.set(id, access);
        });
    }
    async savePermissions() {
        const permissions = Object.fromEntries(this.extensionAccess.entries());
        await this.context.globalState.update(this.storageKey, permissions);
    }
    async requestAccess(extensionId, permissions) {
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
        const response = await vscode.window.showInformationMessage(`Extension "${extension.packageJSON.displayName}" requests the following permissions:\n` +
            permissions.map(p => `- ${this.getPermissionDescription(p)}`).join('\n'), { modal: true }, 'Allow', 'Deny');
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
    hasPermission(extensionId, permission) {
        const access = this.extensionAccess.get(extensionId);
        if (!access || !access.allowed) {
            return false;
        }
        const permissionObj = access.permissions.find(p => p.name === permission);
        return permissionObj?.granted ?? false;
    }
    revokeAccess(extensionId) {
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
    listExtensionAccess() {
        return Array.from(this.extensionAccess.values());
    }
    getPermissionDescription(permission) {
        const descriptions = {
            'read': 'Read extension data and settings',
            'write': 'Modify extension settings',
            'execute': 'Execute extension commands',
            'debug': 'Access extension debug features'
        };
        return descriptions[permission] || permission;
    }
    dispose() {
        this.onPermissionChangedEmitter.removeAllListeners();
    }
}
exports.ExtensionAccessService = ExtensionAccessService;
//# sourceMappingURL=ExtensionAccessService.js.map