import * as vscode from 'vscode';
import * as path from 'path';

/**
 * Service for managing file type preferences
 */
export class FilePreferencesService {
    private fileExtensions: Map<string, number> = new Map();
    private directories: Map<string, number> = new Map();
    private namingPatterns: Map<string, number> = new Map();
    private context: vscode.ExtensionContext;

    /**
     * Create a new FilePreferencesService
     * @param context Extension context for state persistence
     */
    constructor(context: vscode.ExtensionContext) {
        this.context = context;
    }

    /**
     * Initialize service
     */
    public async initialize(): Promise<void> {
        // Load preferences from storage
        const storedPrefs = this.context.globalState.get('filePreferences');
        if (storedPrefs) {
            try {
                const parsedPrefs = JSON.parse(storedPrefs as string);
                if (parsedPrefs.extensions) {
                    Object.entries(parsedPrefs.extensions).forEach(([key, value]) => {
                        this.fileExtensions.set(key, value as number);
                    });
                }
                
                if (parsedPrefs.directories) {
                    Object.entries(parsedPrefs.directories).forEach(([key, value]) => {
                        this.directories.set(key, value as number);
                    });
                }
                
                if (parsedPrefs.namingPatterns) {
                    Object.entries(parsedPrefs.namingPatterns).forEach(([key, value]) => {
                        this.namingPatterns.set(key, value as number);
                    });
                }
            } catch (error) {
                console.error('Failed to parse stored file preferences', error);
            }
        }
    }

    /**
     * Track file extension usage
     * @param extension File extension
     */
    public trackFileExtension(extension: string): void {
        if (!extension.startsWith('.')) {
            extension = `.${extension}`;
        }
        
        const count = this.fileExtensions.get(extension) || 0;
        this.fileExtensions.set(extension, count + 1);
        this.savePreferences();
    }

    /**
     * Track directory usage
     * @param filePath Full path to a file
     */
    public trackDirectory(filePath: string): void {
        const directory = path.dirname(filePath);
        const count = this.directories.get(directory) || 0;
        this.directories.set(directory, count + 1);
        
        // Also track naming pattern
        this.trackNamingPattern(path.basename(filePath));
        
        this.savePreferences();
    }

    /**
     * Track file naming pattern
     * @param fileName Name of the file
     */
    private trackNamingPattern(fileName: string): void {
        // Simple patterns: camelCase, snake_case, kebab-case, PascalCase
        const patterns = [
            { name: 'camelCase', regex: /^[a-z][a-zA-Z0-9]*$/ },
            { name: 'snake_case', regex: /^[a-z][a-z0-9_]*$/ },
            { name: 'kebab-case', regex: /^[a-z][a-z0-9-]*$/ },
            { name: 'PascalCase', regex: /^[A-Z][a-zA-Z0-9]*$/ }
        ];
        
        const baseName = path.parse(fileName).name;
        for (const { name, regex } of patterns) {
            if (regex.test(baseName)) {
                const count = this.namingPatterns.get(name) || 0;
                this.namingPatterns.set(name, count + 1);
                break;
            }
        }
    }

    /**
     * Get most frequently used file extensions
     * @param limit Maximum number of extensions to return
     */
    public getMostFrequentExtensions(limit: number = 5): string[] {
        return Array.from(this.fileExtensions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }

    /**
     * Get recently used directories
     * @param limit Maximum number of directories to return
     */
    public getRecentDirectories(limit: number = 3): string[] {
        return Array.from(this.directories.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }

    /**
     * Get file naming patterns used by the user
     */
    public getNamingPatterns(): string[] {
        return Array.from(this.namingPatterns.entries())
            .sort((a, b) => b[1] - a[1])
            .map(entry => entry[0]);
    }

    /**
     * Check if a file extension is preferred
     * @param extension File extension
     */
    public isPreferredExtension(extension: string): boolean {
        if (!extension.startsWith('.')) {
            extension = `.${extension}`;
        }
        
        const count = this.fileExtensions.get(extension) || 0;
        return count > 0;
    }

    /**
     * Clear all preferences
     */
    public async clearPreferences(): Promise<void> {
        this.fileExtensions.clear();
        this.directories.clear();
        this.namingPatterns.clear();
        await this.savePreferences();
    }

    /**
     * Save preferences to storage
     */
    private async savePreferences(): Promise<void> {
        const prefsObject = {
            extensions: Object.fromEntries(this.fileExtensions.entries()),
            directories: Object.fromEntries(this.directories.entries()),
            namingPatterns: Object.fromEntries(this.namingPatterns.entries())
        };
        
        await this.context.globalState.update('filePreferences', JSON.stringify(prefsObject));
    }
}
