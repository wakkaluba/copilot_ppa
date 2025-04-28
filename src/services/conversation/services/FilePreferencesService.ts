import * as vscode from 'vscode';

/**
 * Service for managing file type preferences
 */
export class FilePreferencesService {
    private fileExtensions: Map<string, number> = new Map();
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
                Object.entries(parsedPrefs).forEach(([key, value]) => {
                    this.fileExtensions.set(key, value as number);
                });
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
        await this.savePreferences();
    }

    /**
     * Save preferences to storage
     */
    private async savePreferences(): Promise<void> {
        const prefsObject = Object.fromEntries(this.fileExtensions.entries());
        await this.context.globalState.update('filePreferences', JSON.stringify(prefsObject));
    }
}
