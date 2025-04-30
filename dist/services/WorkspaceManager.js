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
const logger_1 = require("../utils/logger");
const fs = __importStar(require("fs"));
const path = __importStar(require("path"));
class WorkspaceManager {
    static instance;
    logger;
    constructor() {
        this.logger = logger_1.Logger.getInstance();
    }
    static getInstance() {
        if (!WorkspaceManager.instance) {
            WorkspaceManager.instance = new WorkspaceManager();
        }
        return WorkspaceManager.instance;
    }
    async readFile(filePath) {
        try {
            const resolvedPath = this.resolveFilePath(filePath);
            this.logger.debug(`Reading file: ${resolvedPath}`);
            const data = await fs.promises.readFile(resolvedPath, 'utf8');
            return data;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            this.logger.error(`Failed to read file: ${errorMessage}`);
            throw new Error(`Failed to read file: ${errorMessage}`);
        }
    }
    async writeFile(filePath, content) {
        try {
            const resolvedPath = this.resolveFilePath(filePath);
            this.logger.debug(`Writing to file: ${resolvedPath}`);
            // Ensure the directory exists
            await this.createDirectory(path.dirname(resolvedPath));
            await fs.promises.writeFile(resolvedPath, content, 'utf8');
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            this.logger.error(`Failed to write to file: ${errorMessage}`);
            throw new Error(`Failed to write to file: ${errorMessage}`);
        }
    }
    async deleteFile(filePath) {
        try {
            const resolvedPath = this.resolveFilePath(filePath);
            this.logger.debug(`Deleting file: ${resolvedPath}`);
            await fs.promises.unlink(resolvedPath);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            this.logger.error(`Failed to delete file: ${errorMessage}`);
            throw new Error(`Failed to delete file: ${errorMessage}`);
        }
    }
    async createDirectory(dirPath) {
        try {
            const resolvedPath = this.resolveFilePath(dirPath);
            this.logger.debug(`Creating directory: ${resolvedPath}`);
            await fs.promises.mkdir(resolvedPath, { recursive: true });
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            this.logger.error(`Failed to create directory: ${errorMessage}`);
            throw new Error(`Failed to create directory: ${errorMessage}`);
        }
    }
    async listFiles(dirPath) {
        try {
            const resolvedPath = this.resolveFilePath(dirPath);
            this.logger.debug(`Listing files in directory: ${resolvedPath}`);
            const files = await fs.promises.readdir(resolvedPath);
            return files;
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            this.logger.error(`Failed to list files: ${errorMessage}`);
            throw new Error(`Failed to list files: ${errorMessage}`);
        }
    }
    resolveFilePath(filePath) {
        if (path.isAbsolute(filePath)) {
            return filePath;
        }
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('No workspace folder is open');
        }
        return path.join(workspaceFolders[0].uri.fsPath, filePath);
    }
    async fileExists(filePath) {
        try {
            const resolvedPath = this.resolveFilePath(filePath);
            await fs.promises.access(resolvedPath, fs.constants.F_OK);
            return true;
        }
        catch {
            return false;
        }
    }
    async findFiles(pattern) {
        try {
            this.logger.debug(`Finding files matching pattern: ${pattern}`);
            return await vscode.workspace.findFiles(pattern);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            throw new Error(`Failed to find files: ${errorMessage}`);
        }
    }
    getConfiguration(section) {
        return vscode.workspace.getConfiguration(section);
    }
    async updateConfiguration(section, value, target) {
        try {
            const config = this.getConfiguration('');
            await config.update(section, value, target);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            throw new Error(`Failed to update configuration: ${errorMessage}`);
        }
    }
    async formatDocument(document) {
        try {
            await vscode.commands.executeCommand('editor.action.formatDocument', document);
        }
        catch (error) {
            const errorMessage = error instanceof Error
                ? error.message
                : String(error);
            this.logger.error(`Failed to format document: ${errorMessage}`);
            throw new Error(`Failed to format document: ${errorMessage}`);
        }
    }
    // Methods for todo operations
    parseTodoFile(content) {
        return content.split('\n');
    }
    async updateTodoFile(filePath, lines) {
        const content = lines.join('\n');
        await this.writeFile(filePath, content);
    }
    async moveCompletedTasks(sourceFile, targetFile) {
        const sourceContent = await this.readFile(sourceFile);
        const sourceLines = this.parseTodoFile(sourceContent);
        const completedPattern = /^\s*- \[x\]/i;
        const completedTasks = sourceLines.filter(line => completedPattern.test(line));
        const remainingTasks = sourceLines.filter(line => !completedPattern.test(line));
        // Read the target file if it exists
        let targetLines = [];
        if (await this.fileExists(targetFile)) {
            const targetContent = await this.readFile(targetFile);
            targetLines = this.parseTodoFile(targetContent);
        }
        // Update both files
        await this.updateTodoFile(sourceFile, remainingTasks);
        await this.updateTodoFile(targetFile, [...targetLines, ...completedTasks]);
    }
    async updateTaskStatus(filePath, lineNumber, completed) {
        const content = await this.readFile(filePath);
        const lines = this.parseTodoFile(content);
        if (lineNumber < 0 || lineNumber >= lines.length) {
            throw new Error(`Invalid line number: ${lineNumber}`);
        }
        const line = lines[lineNumber];
        if (completed) {
            lines[lineNumber] = line.replace(/^\s*- \[ \]/i, '- [x]');
        }
        else {
            lines[lineNumber] = line.replace(/^\s*- \[x\]/i, '- [ ]');
        }
        await this.updateTodoFile(filePath, lines);
    }
    dispose() {
        // Cleanup resources if needed
    }
}
exports.WorkspaceManager = WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.js.map