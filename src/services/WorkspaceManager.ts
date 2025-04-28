import * as vscode from 'vscode';
import * as path from 'path';
import { Logger } from '../utils/logger';

/**
 * Manages workspace-related operations such as file reading/writing
 * and directory listing.
 */
export class WorkspaceManager {
    private static instance: WorkspaceManager;
    private logger: Logger;

    /**
     * Private constructor to enforce singleton pattern
     */
    private constructor() {
        this.logger = Logger.getInstance();
    }

    /**
     * Gets the singleton instance of WorkspaceManager
     * @param customLogger Optional logger for testing
     */
    public static getInstance(customLogger?: any): WorkspaceManager {
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
    public static resetInstance(): void {
        WorkspaceManager.instance = undefined as any;
    }

    /**
     * Set logger for testing purposes
     * @param logger Logger instance
     */
    public setLogger(logger: any): void {
        this.logger = logger;
    }

    /**
     * Read file content
     * @param uri File URI or path to read
     * @returns Promise with file content as Buffer
     */
    public async readFile(uri: vscode.Uri | string): Promise<Uint8Array> {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            return await vscode.workspace.fs.readFile(fileUri);
        } catch (error: unknown) {
            this.logger.error(`Error reading file ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to read file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Write content to a file
     * @param uri File URI or path to write
     * @param content Content to write
     */
    public async writeFile(uri: vscode.Uri | string, content: string | Uint8Array): Promise<void> {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            const data = typeof content === 'string' ? Buffer.from(content) : content;
            
            // Ensure parent directory exists
            try {
                const parentDir = vscode.Uri.joinPath(fileUri, '..');
                await vscode.workspace.fs.stat(parentDir);
            } catch {
                await this.createDirectory(vscode.Uri.joinPath(fileUri, '..'));
            }
            
            await vscode.workspace.fs.writeFile(fileUri, data);
            await this.formatDocumentAtPath(fileUri);
        } catch (error: unknown) {
            this.logger.error(`Error writing file ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to write file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Create a new file (alias for writeFile for CommandParser compatibility)
     * @param uri File URI or path to create
     * @param content Content to write
     */
    public async createFile(uri: vscode.Uri | string, content: string | Uint8Array): Promise<void> {
        return this.writeFile(uri, content);
    }

    /**
     * Modify existing file content
     * @param uri File URI or path to modify
     * @param modifier Function that takes existing content and returns modified content
     */
    public async modifyFile(uri: vscode.Uri | string, modifier: (content: string) => string): Promise<void> {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            const contentBuffer = await this.readFile(fileUri);
            const content = Buffer.from(contentBuffer).toString('utf8');
            const modifiedContent = modifier(content);
            await this.writeFile(fileUri, modifiedContent);
        } catch (error: unknown) {
            this.logger.error(`Error modifying file ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to modify file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Delete a file
     * @param uri File URI or path to delete
     */
    public async deleteFile(uri: vscode.Uri | string): Promise<void> {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            await vscode.workspace.fs.delete(fileUri);
        } catch (error: unknown) {
            this.logger.error(`Error deleting file ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Format document if possible
     * @param uri Document URI
     */
    public async formatDocumentAtPath(uri: vscode.Uri | string): Promise<void> {
        try {
            const fileUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            const document = await vscode.workspace.openTextDocument(fileUri);
            
            if (document.languageId !== 'plaintext') {
                await vscode.commands.executeCommand('editor.action.formatDocument');
            }
        } catch (error: unknown) {
            // Just log warning as formatting is not critical
            this.logger.warn(`Format error for ${uri instanceof vscode.Uri ? uri.fsPath : uri}: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Converts a string path to a vscode.Uri
     * @param filePath File path as string
     * @returns VSCode URI object
     */
    public resolveFilePath(filePath: string): vscode.Uri {
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
    public async listDirectory(uri: vscode.Uri | string): Promise<[string, vscode.FileType][]> {
        try {
            const dirUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            const entries = await vscode.workspace.fs.readDirectory(dirUri);
            return entries;
        } catch (error: unknown) {
            this.logger.error(`Error listing directory ${uri instanceof vscode.Uri ? uri.fsPath : uri}:`, error);
            throw new Error(`Failed to list directory: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Check if file exists
     * @param uri File URI to check
     * @returns True if file exists, false otherwise
     */
    public async fileExists(uri: vscode.Uri): Promise<boolean> {
        try {
            await vscode.workspace.fs.stat(uri);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Gets workspace folders
     * @returns Array of workspace folders or null if none
     */
    public getWorkspaceFolders(): readonly vscode.WorkspaceFolder[] | undefined {
        return vscode.workspace.workspaceFolders;
    }

    /**
     * Finds files matching a glob pattern
     * @param pattern Glob pattern
     * @returns Array of matching URIs
     */
    public async findFiles(pattern: string, exclude?: string): Promise<vscode.Uri[]> {
        try {
            return await vscode.workspace.findFiles(pattern, exclude);
        } catch (error: unknown) {
            this.logger.error(`Error finding files with pattern ${pattern}:`, error);
            throw new Error(`Failed to find files: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    /**
     * Creates a directory if it doesn't exist
     * @param uri Directory URI or path
     */
    public async createDirectory(uri: vscode.Uri | string): Promise<void> {
        try {
            const dirUri = uri instanceof vscode.Uri ? uri : this.resolveFilePath(uri);
            await vscode.workspace.fs.createDirectory(dirUri);
        } catch (error: unknown) {
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
    public getConfiguration(section: string, resource?: vscode.Uri): vscode.WorkspaceConfiguration {
        return vscode.workspace.getConfiguration(section, resource);
    }

    /**
     * Update workspace configuration
     * @param section Configuration section
     * @param value New value
     * @param target Configuration target
     * @param resource Resource URI
     */
    public async updateConfiguration(section: string, value: any, target?: vscode.ConfigurationTarget, resource?: vscode.Uri): Promise<void> {
        try {
            const config = this.getConfiguration('', resource);
            await config.update(section, value, target);
        } catch (error: unknown) {
            this.logger.error(`Error updating configuration ${section}:`, error);
            throw new Error(`Failed to update configuration: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
}
