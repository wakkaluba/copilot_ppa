"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePreferencesService = void 0;
/**
 * Service for managing file type preferences
 */
class FilePreferencesService {
    /**
     * Create a new FilePreferencesService
     * @param context Extension context for state persistence
     */
    constructor(context) {
        this.fileExtensions = new Map();
        this.context = context;
    }
    /**
     * Initialize service
     */
    async initialize() {
        // Load preferences from storage
        const storedPrefs = this.context.globalState.get('filePreferences');
        if (storedPrefs) {
            try {
                const parsedPrefs = JSON.parse(storedPrefs);
                Object.entries(parsedPrefs).forEach(([key, value]) => {
                    this.fileExtensions.set(key, value);
                });
            }
            catch (error) {
                console.error('Failed to parse stored file preferences', error);
            }
        }
    }
    /**
     * Track file extension usage
     * @param extension File extension
     */
    trackFileExtension(extension) {
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
    getMostFrequentExtensions(limit = 5) {
        return Array.from(this.fileExtensions.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(entry => entry[0]);
    }
    /**
     * Check if a file extension is preferred
     * @param extension File extension
     */
    isPreferredExtension(extension) {
        if (!extension.startsWith('.')) {
            extension = `.${extension}`;
        }
        const count = this.fileExtensions.get(extension) || 0;
        return count > 0;
    }
    /**
     * Clear all preferences
     */
    async clearPreferences() {
        this.fileExtensions.clear();
        await this.savePreferences();
    }
    /**
     * Save preferences to storage
     */
    async savePreferences() {
        const prefsObject = Object.fromEntries(this.fileExtensions.entries());
        await this.context.globalState.update('filePreferences', JSON.stringify(prefsObject));
    }
}
exports.FilePreferencesService = FilePreferencesService;
//# sourceMappingURL=FilePreferencesService.js.map