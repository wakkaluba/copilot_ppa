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
exports.TrustManager = void 0;
const vscode = __importStar(require("vscode"));
class TrustManager {
    static instance;
    trustedWorkspaces = new Set();
    constructor() {
        this.initializeTrustState();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new TrustManager();
        }
        return this.instance;
    }
    initializeTrustState() {
        if (vscode.workspace.workspaceFolders) {
            for (const folder of vscode.workspace.workspaceFolders) {
                if (folder.uri.scheme === 'file' && vscode.workspace.isTrusted) {
                    this.trustedWorkspaces.add(folder.uri.fsPath);
                }
            }
        }
        vscode.workspace.onDidGrantWorkspaceTrust(() => {
            this.updateTrustState(true);
        });
    }
    updateTrustState(trusted) {
        if (vscode.workspace.workspaceFolders) {
            for (const folder of vscode.workspace.workspaceFolders) {
                if (trusted) {
                    this.trustedWorkspaces.add(folder.uri.fsPath);
                }
                else {
                    this.trustedWorkspaces.delete(folder.uri.fsPath);
                }
            }
        }
    }
    isPathTrusted(path) {
        return this.trustedWorkspaces.has(path) || vscode.workspace.isTrusted;
    }
    // Added method that's used in the tests
    isTrusted() {
        return vscode.workspace.isTrusted;
    }
    async requireTrust(path) {
        if (this.isPathTrusted(path)) {
            return true;
        }
        const result = await vscode.window.showWarningMessage('This operation requires workspace trust. Do you want to trust this workspace?', { modal: true }, 'Trust Workspace', 'Cancel');
        if (result === 'Trust Workspace') {
            // The requestWorkspaceTrust() API is not available directly in all VS Code versions
            // Use the command instead which is more broadly supported
            await vscode.commands.executeCommand('workbench.trust.manage');
            return vscode.workspace.isTrusted;
        }
        return false;
    }
}
exports.TrustManager = TrustManager;
//# sourceMappingURL=TrustManager.js.map