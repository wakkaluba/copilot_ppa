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
exports.WorkspaceManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
class WorkspaceManager {
    constructor() { }
    static getInstance() {
        if (!WorkspaceManager.instance) {
            WorkspaceManager.instance = new WorkspaceManager();
        }
        return WorkspaceManager.instance;
    }
    async readFile(filePath) {
        try {
            const uri = this.resolveFilePath(filePath);
            const content = await vscode.workspace.fs.readFile(uri);
            return Buffer.from(content).toString('utf-8');
        }
        catch (error) {
            throw new Error(`Failed to read file: ${error}`);
        }
    }
    async writeFile(filePath, content) {
        try {
            const uri = this.resolveFilePath(filePath);
            await this.ensureDirectoryExists(uri);
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content, 'utf-8'));
            await this.formatDocument(uri);
        }
        catch (error) {
            throw new Error(`Failed to write file: ${error}`);
        }
    }
    async deleteFile(filePath) {
        try {
            const uri = this.resolveFilePath(filePath);
            await vscode.workspace.fs.delete(uri, { recursive: false });
        }
        catch (error) {
            throw new Error(`Failed to delete file: ${error}`);
        }
    }
    async createDirectory(dirPath) {
        try {
            const uri = this.resolveFilePath(dirPath);
            await vscode.workspace.fs.createDirectory(uri);
        }
        catch (error) {
            throw new Error(`Failed to create directory: ${error}`);
        }
    }
    async listFiles(dirPath) {
        try {
            const uri = this.resolveFilePath(dirPath);
            const files = await vscode.workspace.fs.readDirectory(uri);
            return files.map(([name]) => path.join(dirPath, name));
        }
        catch (error) {
            throw new Error(`Failed to list files: ${error}`);
        }
    }
    resolveFilePath(filePath) {
        if (path.isAbsolute(filePath)) {
            return vscode.Uri.file(filePath);
        }
        const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
        if (!workspaceFolder) {
            throw new Error('No workspace folder found');
        }
        return vscode.Uri.joinPath(workspaceFolder.uri, filePath);
    }
    async ensureDirectoryExists(uri) {
        const dirUri = vscode.Uri.file(path.dirname(uri.fsPath));
        try {
            await vscode.workspace.fs.stat(dirUri);
        }
        catch {
            await vscode.workspace.fs.createDirectory(dirUri);
        }
    }
    async formatDocument(uri) {
        try {
            const document = await vscode.workspace.openTextDocument(uri);
            const languageId = document.languageId;
            // Get language-specific formatting options
            const config = vscode.workspace.getConfiguration('editor', document);
            const formattingOptions = {
                insertSpaces: config.get('insertSpaces', true),
                tabSize: config.get('tabSize', 4)
            };
            // Try to format with language-specific formatter first
            const edits = await vscode.commands.executeCommand('vscode.executeFormatDocumentProvider', uri, formattingOptions);
            if (edits && edits.length > 0) {
                const edit = new vscode.WorkspaceEdit();
                edit.set(uri, edits);
                await vscode.workspace.applyEdit(edit);
            }
            else {
                // Fallback to default formatter
                const editor = await vscode.window.showTextDocument(document, { preview: false });
                await vscode.commands.executeCommand('editor.action.formatDocument');
            }
            // Save the formatted document
            await document.save();
        }
        catch (error) {
            console.warn(`Failed to format document: ${error}`);
            // Don't throw - formatting is non-critical
        }
    }
    async formatDocumentAtPath(filePath) {
        try {
            const uri = this.resolveFilePath(filePath);
            await this.formatDocument(uri);
            return true;
        }
        catch (error) {
            console.warn(`Failed to format document at ${filePath}: ${error}`);
            return false;
        }
    }
    async updateTodoFile(filePath, content) {
        const fileContent = content.join('\n');
        await this.writeFile(filePath, fileContent);
    }
    async parseTodoFile(filePath) {
        const content = await this.readFile(filePath);
        return content.split('\n').filter(line => line.trim() !== '');
    }
    async moveCompletedTasks(fromPath, toPath) {
        const sourceLines = await this.parseTodoFile(fromPath);
        const targetLines = await this.fileExists(toPath)
            ? await this.parseTodoFile(toPath)
            : [];
        const [completedTasks, remainingTasks] = sourceLines.reduce(([completed, remaining], line) => {
            if (line.includes('- [X]') && line.includes('(100%)')) {
                // Add completion date if not present
                if (!line.includes('[completed:')) {
                    const today = new Date().toISOString().split('T')[0];
                    line = `${line} [completed: ${today}]`;
                }
                completed.push(line);
            }
            else {
                remaining.push(line);
            }
            return [completed, remaining];
        }, [[], []]);
        if (completedTasks.length > 0) {
            await this.updateTodoFile(fromPath, remainingTasks);
            await this.updateTodoFile(toPath, [...targetLines, ...completedTasks]);
        }
    }
    async fileExists(filePath) {
        try {
            const uri = this.resolveFilePath(filePath);
            await vscode.workspace.fs.stat(uri);
            return true;
        }
        catch {
            return false;
        }
    }
    async updateTaskStatus(filePath) {
        const lines = await this.parseTodoFile(filePath);
        const updatedLines = lines.map(line => {
            if (!line.trim().startsWith('-'))
                return line;
            // Add status indicator if missing
            if (!line.includes('- [')) {
                line = line.replace(/^-/, '- [ ]');
            }
            // Add percentage if missing
            if (!line.includes('%)')) {
                // Check if it's completed
                if (line.includes('- [X]')) {
                    line = `${line} (100%)`;
                }
                else if (line.includes('- [/]')) {
                    line = `${line} (50%)`;
                }
                else {
                    line = `${line} (0%)`;
                }
            }
            return line;
        });
        await this.updateTodoFile(filePath, updatedLines);
    }
    getTaskStatus(line) {
        if (line.includes('- [X]'))
            return 'completed';
        if (line.includes('- [/]'))
            return 'in-progress';
        if (line.includes('- [-]'))
            return 'do-not-touch';
        return 'not-started';
    }
    getTaskPercentage(line) {
        const match = line.match(/\((\d+)%\)/);
        return match ? parseInt(match[1]) : 0;
    }
    async updateTaskStatus(filePath) {
        const lines = await this.parseTodoFile(filePath);
        const updatedLines = lines.map(line => {
            if (!line.trim().startsWith('-'))
                return line;
            if (!line.includes('- [')) {
                return line.replace(/^-/, '- [ ]');
            }
            if (!line.includes('%)')) {
                return `${line} (0%)`;
            }
            return line;
        });
        await this.updateTodoFile(filePath, updatedLines);
    }
}
exports.WorkspaceManager = WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.js.map