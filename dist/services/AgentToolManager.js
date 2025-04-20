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
exports.AgentToolManager = void 0;
const vscode = __importStar(require("vscode"));
const WorkspaceManager_1 = require("./WorkspaceManager");
class AgentToolManager {
    static instance;
    workspaceManager;
    constructor() {
        this.workspaceManager = WorkspaceManager_1.WorkspaceManager.getInstance();
    }
    static getInstance() {
        if (!AgentToolManager.instance) {
            AgentToolManager.instance = new AgentToolManager();
        }
        return AgentToolManager.instance;
    }
    async editFile(filePath, content, line) {
        try {
            const originalContent = await this.workspaceManager.readFile(filePath);
            const newContent = line !== undefined
                ? this.replaceLineContent(originalContent, content, line)
                : content;
            const approved = await this.confirmChange(filePath, originalContent, newContent);
            if (!approved) {
                return false;
            }
            await this.workspaceManager.writeFile(filePath, newContent);
            await this.workspaceManager.formatDocumentAtPath(filePath);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to edit file: ${error}`);
            return false;
        }
    }
    async createFile(filePath, content) {
        try {
            const approved = await this.confirmChange(filePath, '', content);
            if (!approved) {
                return false;
            }
            await this.workspaceManager.writeFile(filePath, content);
            await this.workspaceManager.formatDocumentAtPath(filePath);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to create file: ${error}`);
            return false;
        }
    }
    async deleteFile(filePath) {
        try {
            const content = await this.workspaceManager.readFile(filePath);
            const approved = await this.confirmDelete(filePath, content);
            if (!approved) {
                return false;
            }
            await this.workspaceManager.deleteFile(filePath);
            return true;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to delete file: ${error}`);
            return false;
        }
    }
    async explainFile(filePath, line) {
        try {
            const content = await this.workspaceManager.readFile(filePath);
            if (line !== undefined) {
                const lines = content.split('\n');
                if (line > 0 && line <= lines.length) {
                    return lines[line - 1];
                }
            }
            return content;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Failed to read file for explanation: ${error}`);
            return '';
        }
    }
    async searchWorkspace(query) {
        try {
            const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
            if (!workspaceFolder) {
                throw new Error('No workspace folder found');
            }
            const files = await vscode.workspace.findFiles('**/*', '**/node_modules/**');
            const results = [];
            for (const file of files) {
                const content = await this.workspaceManager.readFile(file.fsPath);
                if (content.toLowerCase().includes(query.toLowerCase())) {
                    results.push(file.fsPath);
                }
            }
            return results;
        }
        catch (error) {
            vscode.window.showErrorMessage(`Search failed: ${error}`);
            return [];
        }
    }
    async confirmChange(filePath, oldContent, newContent) {
        const diff = await vscode.commands.executeCommand('vscode.diff', vscode.Uri.parse('untitled:Original'), vscode.Uri.parse('untitled:Modified'), `Changes to ${filePath}`, { preview: true });
        const result = await vscode.window.showWarningMessage(`Do you want to apply these changes to ${filePath}?`, { modal: true }, 'Apply', 'Cancel');
        return result === 'Apply';
    }
    async confirmDelete(filePath, content) {
        const result = await vscode.window.showWarningMessage(`Are you sure you want to delete ${filePath}?`, { modal: true }, 'Delete', 'Cancel');
        return result === 'Delete';
    }
    replaceLineContent(originalContent, newContent, line) {
        const lines = originalContent.split('\n');
        if (line > 0 && line <= lines.length) {
            lines[line - 1] = newContent;
        }
        return lines.join('\n');
    }
}
exports.AgentToolManager = AgentToolManager;
//# sourceMappingURL=AgentToolManager.js.map