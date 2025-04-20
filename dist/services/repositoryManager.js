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
exports.RepositoryManager = void 0;
const vscode = __importStar(require("vscode"));
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
class RepositoryManager {
    static instance;
    _isEnabled;
    _statusBarItem;
    _onDidChangeAccess;
    constructor() {
        this._onDidChangeAccess = new vscode.EventEmitter();
        this._isEnabled = vscode.workspace.getConfiguration('copilot-ppa').get('repository.enabled', false);
        this._statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 99);
        this.updateStatusBar();
    }
    static getInstance() {
        if (!RepositoryManager.instance) {
            RepositoryManager.instance = new RepositoryManager();
        }
        return RepositoryManager.instance;
    }
    get onDidChangeAccess() {
        return this._onDidChangeAccess.event;
    }
    async toggleAccess() {
        this._isEnabled = !this._isEnabled;
        await vscode.workspace.getConfiguration('copilot-ppa').update('repository.enabled', this._isEnabled, vscode.ConfigurationTarget.Global);
        this.updateStatusBar();
        this._onDidChangeAccess.fire(this._isEnabled);
        await vscode.window.showInformationMessage(`Repository access ${this._isEnabled ? 'enabled' : 'disabled'}`);
    }
    isEnabled() {
        return this._isEnabled;
    }
    updateStatusBar() {
        this._statusBarItem.text = `$(git-branch) Repository: ${this._isEnabled ? 'Enabled' : 'Disabled'}`;
        this._statusBarItem.tooltip = 'Click to toggle repository access';
        this._statusBarItem.command = 'copilot-ppa.toggleRepositoryAccess';
        this._statusBarItem.show();
    }
    dispose() {
        this._statusBarItem.dispose();
        this._onDidChangeAccess.dispose();
    }
    async createNewRepository() {
        if (!this._isEnabled) {
            throw new Error('Repository access is disabled');
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders) {
            throw new Error('No workspace folder open');
        }
        const options = await this.getRepositoryOptions();
        if (!options) {
            return; // User cancelled
        }
        try {
            await this.initializeGitRepository(workspaceFolders[0].uri.fsPath, options);
            vscode.window.showInformationMessage('Repository created successfully!');
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create repository: ${error}`);
        }
    }
    async getRepositoryOptions() {
        const name = await vscode.window.showInputBox({
            prompt: 'Enter repository name',
            placeHolder: 'my-project'
        });
        if (!name)
            return undefined;
        const description = await vscode.window.showInputBox({
            prompt: 'Enter repository description (optional)',
            placeHolder: 'A brief description of the project'
        });
        return { name, description: description || '' };
    }
    async initializeGitRepository(path, options) {
        await execAsync('git init', { cwd: path });
        await execAsync('git add .', { cwd: path });
        await execAsync('git commit -m "Initial commit"', { cwd: path });
        // Create README.md if it doesn't exist
        const readmePath = vscode.Uri.file(path + '/README.md');
        const readmeContent = `# ${options.name}\n\n${options.description}`;
        try {
            await vscode.workspace.fs.stat(readmePath);
        }
        catch {
            await vscode.workspace.fs.writeFile(readmePath, Buffer.from(readmeContent));
        }
    }
}
exports.RepositoryManager = RepositoryManager;
//# sourceMappingURL=repositoryManager.js.map