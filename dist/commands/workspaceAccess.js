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
exports.WorkspaceAccessManager = void 0;
const vscode = __importStar(require("vscode"));
class WorkspaceAccessManager {
    constructor() {
        this._onDidChangeAccess = new vscode.EventEmitter();
        this._isEnabled = vscode.workspace.getConfiguration('copilot-ppa').get('workspaceAccess.enabled', false);
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
        this.updateStatusBar();
    }
    static getInstance() {
        if (!WorkspaceAccessManager.instance) {
            WorkspaceAccessManager.instance = new WorkspaceAccessManager();
        }
        return WorkspaceAccessManager.instance;
    }
    get onDidChangeAccess() {
        return this._onDidChangeAccess.event;
    }
    async toggleAccess() {
        this._isEnabled = !this._isEnabled;
        await vscode.workspace.getConfiguration('copilot-ppa').update('workspaceAccess.enabled', this._isEnabled, vscode.ConfigurationTarget.Global);
        this.updateStatusBar();
        this._onDidChangeAccess.fire(this._isEnabled);
        await vscode.window.showInformationMessage(`Workspace access ${this._isEnabled ? 'enabled' : 'disabled'}`);
    }
    isEnabled() {
        return this._isEnabled;
    }
    updateStatusBar() {
        this._statusBarItem.text = `$(${this._isEnabled ? 'unlock' : 'lock'}) Workspace: ${this._isEnabled ? 'Enabled' : 'Disabled'}`;
        this._statusBarItem.tooltip = 'Click to toggle workspace access';
        this._statusBarItem.command = 'copilot-ppa.toggleWorkspaceAccess';
        this._statusBarItem.show();
    }
    dispose() {
        this._statusBarItem.dispose();
        this._onDidChangeAccess.dispose();
    }
}
exports.WorkspaceAccessManager = WorkspaceAccessManager;
//# sourceMappingURL=workspaceAccess.js.map