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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApprovalManager = void 0;
const vscode = __importStar(require("vscode"));
const WorkspaceManager_1 = require("./WorkspaceManager");
const TrustManager_1 = require("./TrustManager");
class ApprovalManager {
    constructor() {
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
        this.trustManager = TrustManager_1.TrustManager.getInstance();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new ApprovalManager();
        }
        return this.instance;
    }
    async requestApproval(changes) {
        // Check workspace trust first
        for (const change of changes) {
            if (!await this.trustManager.requireTrust(change.filePath)) {
                return false;
            }
        }
        const previewResult = await this.showChangePreview(changes);
        if (!previewResult) {
            return false;
        }
        return await this.showConfirmationDialog(changes);
    }
    async showChangePreview(changes) {
        for (const change of changes) {
            const diff = await this.createDiffView(change);
            const choice = await vscode.window.showInformationMessage(`Preview changes for ${change.filePath}?`, 'Show Preview', 'Skip', 'Cancel');
            if (choice === 'Cancel') {
                return false;
            }
            if (choice === 'Show Preview') {
                await vscode.commands.executeCommand('vscode.diff', this.createTempUri(change.filePath, 'original'), this.createTempUri(change.filePath, 'modified'), `${change.filePath} (Preview)`);
            }
        }
        return true;
    }
    async showConfirmationDialog(changes) {
        const message = this.createConfirmationMessage(changes);
        const choice = await vscode.window.showWarningMessage(message, { modal: true }, 'Apply Changes', 'Cancel');
        return choice === 'Apply Changes';
    }
    createConfirmationMessage(changes) {
        const summary = changes.reduce((acc, change) => {
            acc[change.type]++;
            return acc;
        }, { create: 0, modify: 0, delete: 0 });
        return `The following changes will be applied:
• ${summary.create} files to create
• ${summary.modify} files to modify
• ${summary.delete} files to delete

Do you want to proceed?`;
    }
    createTempUri(filePath, type) {
        return vscode.Uri.parse(`untitled:${filePath}.${type}`);
    }
    async createDiffView(change) {
        // Implementation for diff view creation
        // This would be used by the preview system
    }
}
exports.ApprovalManager = ApprovalManager;
//# sourceMappingURL=ApprovalManager.js.map