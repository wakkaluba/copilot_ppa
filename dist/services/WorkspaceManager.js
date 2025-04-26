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
const Logger_1 = require("../utils/Logger");
/**
 * Manages workspace-related operations such as file reading/writing
 * and directory listing.
 */
class WorkspaceManager {
    static instance;
    logger;
    constructor() {
        this.logger = Logger_1.Logger.getInstance();
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
            this.logger.error(`Failed to find files with pattern ${include}:`, error);
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
            this.logger.error(`Failed to create directory ${uri.fsPath}:`, error);
            throw error;
        }
    }
}
exports.WorkspaceManager = WorkspaceManager;
//# sourceMappingURL=WorkspaceManager.js.map