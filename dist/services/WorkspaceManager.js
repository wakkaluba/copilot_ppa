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
const logger_1 = require("../utils/logger"); // Fixed lowercase import
/**
 * Manages workspace-related operations such as file reading/writing
 * and directory listing.
 */
class WorkspaceManager {
    constructor() {
        this.logger = logger_1.Logger.getInstance();
    }
    /**
     * Gets the singleton instance of WorkspaceManager
     */
    static getInstance() {
        if (!WorkspaceManager.instance) {
            WorkspaceManager.instance = new WorkspaceManager();
        }
        return WorkspaceManager.instance;
    }
    /**
     * Set logger for testing purposes
     * @param logger Logger instance
     */
    setLogger(logger) {
        this.logger = logger;
    }
    /**
     * Read file content as string
     * @param uri The URI of the file to read
     * @returns Contents of the file as string
     */
    async readFile(uri) {
        try {
            const content = await vscode.workspace.fs.readFile(uri);
            return new TextDecoder().decode(content);
        }
        catch (error) {
            this.logger.error(`Failed to read file ${uri.fsPath}:`, error);
            throw error;
        }
    }
    /**
     * Write content to a file
     * @param uri The URI of the file to write to
     * @param content Content to write
     */
    async writeFile(uri, content) {
        try {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
        }
        catch (error) {
            this.logger.error(`Failed to write file ${uri.fsPath}:`, error);
            throw error;
        }
    }
    /**
     * List the contents of a directory
     * @param uri The URI of the directory
     * @returns Array of directory entries
     */
    async listDirectory(uri) {
        try {
            return await vscode.workspace.fs.readDirectory(uri);
        }
        catch (error) {
            this.logger.error(`Failed to list directory ${uri.fsPath}:`, error);
            throw error;
        }
    }
    /**
     * Check if a file exists
     * @param uri The URI of the file to check
     * @returns true if the file exists
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
     * Get workspace folders
     * @returns Array of workspace folders
     */
    getWorkspaceFolders() {
        return vscode.workspace.workspaceFolders;
    }
    /**
     * Find files in the workspace matching a pattern
     * @param include glob pattern to match files
     * @param exclude glob pattern to exclude files
     * @param maxResults max number of results
     * @returns Array of found file URIs
     */
    async findFiles(include, exclude, maxResults) {
        try {
            return await vscode.workspace.findFiles(include, exclude, maxResults);
        }
        catch (error) {
            this.logger.error(`Error finding files with pattern ${include}:`, error);
            throw error;
        }
    }
    /**
     * Create a directory
     * @param uri The URI of the directory to create
     */
    async createDirectory(uri) {
        try {
            await vscode.workspace.fs.createDirectory(uri);
        }
        catch (error) {
            this.logger.error(`Error creating directory ${uri.fsPath}:`, error);
            throw error;
        }
    }
    getConfiguration(section, key, defaultValue) {
        const config = vscode.workspace.getConfiguration(section);
        return config.get(key, defaultValue);
    }
    /**
     * Update configuration value
     * @param section Configuration section
     * @param key Configuration key
     * @param value New value
     * @param target Configuration target (default: Workspace)
     */
    async updateConfiguration(section, key, value, target = vscode.ConfigurationTarget.Workspace) {
        try {
            const config = vscode.workspace.getConfiguration(section);
            await config.update(key, value, target);
        }
        catch (error) {
            this.logger.error(`Error updating configuration ${section}.${key}:`, error);
            throw error;
        }
    }
    /**
     * Delete a file
     * @param uri The URI of the file to delete
     */
    async deleteFile(uri) {
        try {
            await vscode.workspace.fs.delete(uri);
        }
        catch (error) {
            this.logger.error(`Failed to delete file ${uri.fsPath}:`, error);
            throw error;
        }
    }
    /**
     * List files in a directory
     * @param directoryPath The path of the directory to list files from
     * @returns Array of file paths
     */
    async listFiles(directoryPath) {
        try {
            const uri = vscode.Uri.joinPath(vscode.workspace.workspaceFolders?.[0].uri || vscode.Uri.file('.'), directoryPath);
            const entries = await this.listDirectory(uri);
            return entries
                .filter(([_, type]) => type === vscode.FileType.File)
                .map(([name, _]) => `${directoryPath}/${name}`);
        }
        catch (error) {
            this.logger.error(`Failed to list files in ${directoryPath}:`, error);
            return [];
        }
    }
}
exports.WorkspaceManager = WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.js.map