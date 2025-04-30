import * as vscode from 'vscode';
/**
 * Service for managing file type preferences
 */
export declare class FilePreferencesService {
    private fileExtensions;
    private directories;
    private namingPatterns;
    private context;
    /**
     * Create a new FilePreferencesService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext);
    /**
     * Initialize service
     */
    initialize(): Promise<void>;
    /**
     * Track file extension usage
     * @param extension File extension
     */
    trackFileExtension(extension: string): void;
    /**
     * Track directory usage
     * @param filePath Full path to a file
     */
    trackDirectory(filePath: string): void;
    /**
     * Track file naming pattern
     * @param fileName Name of the file
     */
    private trackNamingPattern;
    /**
     * Get most frequently used file extensions
     * @param limit Maximum number of extensions to return
     */
    getMostFrequentExtensions(limit?: number): string[];
    /**
     * Get recently used directories
     * @param limit Maximum number of directories to return
     */
    getRecentDirectories(limit?: number): string[];
    /**
     * Get file naming patterns used by the user
     */
    getNamingPatterns(): string[];
    /**
     * Check if a file extension is preferred
     * @param extension File extension
     */
    isPreferredExtension(extension: string): boolean;
    /**
     * Clear all preferences
     */
    clearPreferences(): Promise<void>;
    /**
     * Save preferences to storage
     */
    private savePreferences;
}
