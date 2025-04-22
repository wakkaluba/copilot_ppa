"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePreferences = void 0;
class FilePreferences {
    _context;
    _recentExtensions = [];
    _recentDirectories = [];
    _namingPatterns = [];
    _storageKey = 'fileManagementPreferences';
    _maxExtensions = 10;
    _maxDirectories = 5;
    _maxPatterns = 5;
    constructor(context) {
        this._context = context;
    }
    async initialize() {
        try {
            const storedData = this._context.globalState.get(this._storageKey);
            if (storedData) {
                this._recentExtensions = storedData.recentExtensions || [];
                this._recentDirectories = storedData.recentDirectories || [];
                this._namingPatterns = storedData.namingPatterns || [];
            }
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to initialize file preferences: ${errorMessage}`);
        }
    }
    addRecentExtension(extension) {
        // Move to front if exists, otherwise add to front
        this._recentExtensions = [
            extension,
            ...this._recentExtensions.filter(ext => ext !== extension)
        ];
        // Keep the list within size limit
        if (this._recentExtensions.length > this._maxExtensions) {
            this._recentExtensions = this._recentExtensions.slice(0, this._maxExtensions);
        }
        this.saveToStorage().catch(error => {
            console.error('Failed to save file preferences:', error);
        });
    }
    getRecentExtensions(limit) {
        return this._recentExtensions.slice(0, Math.min(limit, this._maxExtensions));
    }
    addRecentDirectory(directory) {
        // Move to front if exists, otherwise add to front
        this._recentDirectories = [
            directory,
            ...this._recentDirectories.filter(dir => dir !== directory)
        ];
        // Keep the list within size limit
        if (this._recentDirectories.length > this._maxDirectories) {
            this._recentDirectories = this._recentDirectories.slice(0, this._maxDirectories);
        }
        this.saveToStorage().catch(error => {
            console.error('Failed to save file preferences:', error);
        });
    }
    getRecentDirectories(limit) {
        return this._recentDirectories.slice(0, Math.min(limit, this._maxDirectories));
    }
    addNamingPattern(pattern) {
        if (!this._namingPatterns.includes(pattern)) {
            this._namingPatterns.push(pattern);
            // Keep the list within size limit
            if (this._namingPatterns.length > this._maxPatterns) {
                this._namingPatterns = this._namingPatterns.slice(-this._maxPatterns);
            }
            this.saveToStorage().catch(error => {
                console.error('Failed to save file preferences:', error);
            });
        }
    }
    getNamingPatterns() {
        return [...this._namingPatterns];
    }
    async clearPreferences() {
        try {
            this._recentExtensions = [];
            this._recentDirectories = [];
            this._namingPatterns = [];
            await this._context.globalState.update(this._storageKey, undefined);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to clear file preferences: ${errorMessage}`);
        }
    }
    async saveToStorage() {
        try {
            const data = {
                recentExtensions: this._recentExtensions,
                recentDirectories: this._recentDirectories,
                namingPatterns: this._namingPatterns
            };
            await this._context.globalState.update(this._storageKey, data);
        }
        catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            throw new Error(`Failed to save file preferences: ${errorMessage}`);
        }
    }
}
exports.FilePreferences = FilePreferences;
//# sourceMappingURL=FilePreferences.js.map