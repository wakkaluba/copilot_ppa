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
exports.WorkspaceManager = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const logger_1 = require("../utils/logger");
/**
 * Manages workspace-related operations such as file reading/writing
 * and directory listing.
 */
class WorkspaceManager {
    /**
     * Private constructor to enforce singleton pattern
     */
    constructor() {
        this.logger = logger_1.Logger.getInstance();
    }
    /**
     * Gets the singleton instance of WorkspaceManager
     * @param customLogger Optional logger for testing
     */
    static getInstance(customLogger) {
        if (!WorkspaceManager.instance) {
            WorkspaceManager.instance = new WorkspaceManager();
            if (customLogger) {
                WorkspaceManager.instance.setLogger(customLogger);
            }
        }
        return WorkspaceManager.instance;
    }
    /**
     * Reset the singleton instance (for testing purposes)
     */
    static resetInstance() {
        WorkspaceManager.instance = undefined;
    }
    /**
     * Set logger for testing purposes
     * @param logger Logger instance
     */
    setLogger(logger) {
        this.logger = logger;
    }
    /**
     * Read file content
     * @param uri File URI or path to read
     * @returns Promise with file content as Buffer
     */
    async readFile(uri) {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            return await vscode.workspace.fs.readFile(fileUri);
        }
        catch (error) {
            this.logger.error(`Error reading file ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Write content to a file
     * @param uri File URI or path to write
     * @param content Content to write
     */
    async writeFile(uri, content) {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            const data = typeof content === 'string' ? Buffer.from(content) : content;
            // Ensure parent directory exists
            try {
                const parentDir = vscode.Uri.joinPath(fileUri, '..');
                await vscode.workspace.fs.stat(parentDir);
            }
            catch {
                await this.createDirectory(vscode.Uri.joinPath(fileUri, '..'));
            }
            await vscode.workspace.fs.writeFile(fileUri, data);
            await this.formatDocumentAtPath(fileUri);
        }
        catch (error) {
            this.logger.error(`Error writing file ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Delete a file
     * @param uri File URI or path to delete
     */
    async deleteFile(uri) {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            await vscode.workspace.fs.delete(fileUri);
        }
        catch (error) {
            this.logger.error(`Error deleting file ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Format document if possible
     * @param uri Document URI
     */
    async formatDocumentAtPath(uri) {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            const document = await vscode.workspace.openTextDocument(fileUri);
            if (document.languageId !== 'plaintext') {
                await vscode.commands.executeCommand('editor.action.formatDocument');
            }
        }
        catch (error) {
            // Just log warning as formatting is not critical
            this.logger.warn(`Format error for ${uri instanceof vscode.Uri ? uri.fsPath : uri}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Converts a string path to a vscode.Uri
     * @param filePath File path as string
     * @returns VSCode URI object
     */
    resolveFilePath(filePath) {
        if (!filePath) {
            throw new Error('File path cannot be empty');
        }
        // Handle absolute paths
        if (path.isAbsolute(filePath)) {
            return vscode.Uri.file(filePath);
        }
        // Handle workspace-relative paths
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (!workspaceFolders || workspaceFolders.length === 0) {
            throw new Error('No workspace folder is open');
        }
        // Use the first workspace folder as a base
        return vscode.Uri.joinPath(workspaceFolders[0].uri, filePath);
    }
    /**
     * List directory contents
     * @param uri Directory URI or path
     * @returns Array of file entries
     */
    async listDirectory(uri) {
        try {
            const dirUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            const entries = await vscode.workspace.fs.readDirectory(dirUri);
            return entries;
        }
        catch (error) {
            this.logger.error(`Error listing directory ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Check if file exists
     * @param uri File URI to check
     * @returns True if file exists, false otherwise
     */
    async fileExists(uri) {
        try {
            await vscode.workspace.fs.stat(uri);
            return true;
        }
        catch {
            return false;
        }
    }
    /**
     * Gets workspace folders
     * @returns Array of workspace folders or null if none
     */
    getWorkspaceFolders() {
        return vscode.workspace.workspaceFolders;
    }
    /**
     * Finds files matching a glob pattern
     * @param pattern Glob pattern
     * @returns Array of matching URIs
     */
    async findFiles(pattern, exclude) {
        try {
            return await vscode.workspace.findFiles(pattern, exclude);
        }
        catch (error) {
            this.logger.error(`Error finding files with pattern ${pattern}:`, error);
            throw new Error(`Failed to find files: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Creates a directory if it doesn't exist
     * @param uri Directory URI or path
     */
    async createDirectory(uri) {
        try {
            const dirUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            await vscode.workspace.fs.createDirectory(dirUri);
        }
        catch (error) {
            this.logger.error(`Error creating directory ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to create directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    /**
     * Get workspace configuration
     * @param section Configuration section
     * @param resource Resource URI
     * @returns Configuration object
     */
    getConfiguration(section, resource) {
        return vscode.workspace.getConfiguration(section, resource);
    }
    /**
     * Update workspace configuration
     * @param section Configuration section
     * @param value New value
     * @param target Configuration target
     * @param resource Resource URI
     */
    async updateConfiguration(section, value, target, resource) {
        try {
            const config = this.getConfiguration('', resource);
            await config.update(section, value, target);
        }
        catch (error) {
            this.logger.error(`Error updating configuration ${section}:`, error);
            throw new Error(`Failed to update configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
exports.WorkspaceManager = WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.js.map