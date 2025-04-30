"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilePreferences = void 0;
class FilePreferences {
    fileExtensions = new Set();
    directories = new Set();
    filePatterns = new Set();
    /**
     * Add a file extension to track
     * @param extension The file extension without dot (e.g., "ts", "js")
     */
    addFileExtension(extension) {
        this.fileExtensions.add(extension.toLowerCase().replace(/^\./, ''));
    }
    /**
     * Get all tracked file extensions
     * @returns Array of file extensions
     */
    getFileExtensions() {
        return Array.from(this.fileExtensions);
    }
    /**
     * Add a directory path to track
     * @param directory The directory path
     */
    addDirectory(directory) {
        this.directories.add(directory.replace(/\\/g, '/'));
    }
    /**
     * Get all tracked directories
     * @returns Array of directory paths
     */
    getDirectories() {
        return Array.from(this.directories);
    }
    /**
     * Add a file naming pattern to track
     * @param pattern The file naming pattern (e.g., "component.tsx")
     */
    addFilePattern(pattern) {
        this.filePatterns.add(pattern);
    }
    /**
     * Get all tracked file naming patterns
     * @returns Array of file naming patterns
     */
    getFilePatterns() {
        return Array.from(this.filePatterns);
    }
    /**
     * Clear all tracked preferences
     */
    clear() {
        this.fileExtensions.clear();
        this.directories.clear();
        this.filePatterns.clear();
    }
}
exports.FilePreferences = FilePreferences;
//# sourceMappingURL=FilePreferences.js.map