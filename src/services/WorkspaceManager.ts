import * as vscode from 'vscode';
import { Logger } from '../utils/logger'; // Fixed lowercase import

/**
 * Manages workspace-related operations such as file reading/writing
 * and directory listing.
 */
export class WorkspaceManager {
    private static instance: WorkspaceManager;
    private logger: Logger;

    private constructor() {
        this.logger = Logger.getInstance();
    }

    /**
     * Gets the singleton instance of WorkspaceManager
     */
    public static getInstance(): WorkspaceManager {
        if (!WorkspaceManager.instance) {
            WorkspaceManager.instance = new WorkspaceManager();
        }
        return WorkspaceManager.instance;
    }

    /**
     * Set logger for testing purposes
     * @param logger Logger instance
     */
    private setLogger(logger: Logger) {
        this.logger = logger;
    }

    /**
     * Read file content as string
     * @param uri The URI of the file to read
     * @returns Contents of the file as string
     */
    public async readFile(uri: vscode.Uri): Promise<string> {
        try {
            const content = await vscode.workspace.fs.readFile(uri);
            return new TextDecoder().decode(content);
        } catch (error) {
            this.logger.error(`Failed to read file ${uri.fsPath}:`, error);
            throw error;
        }
    }

    /**
     * Write content to a file
     * @param uri The URI of the file to write to
     * @param content Content to write
     */
    public async writeFile(uri: vscode.Uri, content: string): Promise<void> {
        try {
            await vscode.workspace.fs.writeFile(uri, Buffer.from(content));
        } catch (error) {
            this.logger.error(`Failed to write file ${uri.fsPath}:`, error);
            throw error;
        }
    }

    /**
     * List the contents of a directory
     * @param uri The URI of the directory
     * @returns Array of directory entries
     */
    public async listDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        try {
            return await vscode.workspace.fs.readDirectory(uri);
        } catch (error) {
            this.logger.error(`Failed to list directory ${uri.fsPath}:`, error);
            throw error;
        }
    }

    /**
     * Check if a file exists
     * @param uri The URI of the file to check
     * @returns true if the file exists
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
     * Get workspace folders
     * @returns Array of workspace folders
     */
    public getWorkspaceFolders(): readonly vscode.WorkspaceFolder[] | undefined {
        return vscode.workspace.workspaceFolders;
    }

    /**
     * Find files in the workspace matching a pattern
     * @param include glob pattern to match files
     * @param exclude glob pattern to exclude files
     * @param maxResults max number of results
     * @returns Array of found file URIs
     */
    public async findFiles(include: string, exclude?: string, maxResults?: number): Promise<vscode.Uri[]> {
        try {
            return await vscode.workspace.findFiles(include, exclude, maxResults);
        } catch (error) {
            this.logger.error(`Failed to find files with pattern ${include}:`, error);
            throw error;
        }
    }

    /**
     * Create a directory
     * @param uri The URI of the directory to create
     */
    public async createDirectory(uri: vscode.Uri): Promise<void> {
        try {
            await vscode.workspace.fs.createDirectory(uri);
        } catch (error) {
            this.logger.error(`Failed to create directory ${uri.fsPath}:`, error);
            throw error;
        }
    }
}
