export declare class FilePreferences {
    private fileExtensions;
    private directories;
    private filePatterns;
    /**
     * Add a file extension to track
     * @param extension The file extension without dot (e.g., "ts", "js")
     */
    addFileExtension(extension: string): void;
    /**
     * Get all tracked file extensions
     * @returns Array of file extensions
     */
    getFileExtensions(): string[];
    /**
     * Add a directory path to track
     * @param directory The directory path
     */
    addDirectory(directory: string): void;
    /**
     * Get all tracked directories
     * @returns Array of directory paths
     */
    getDirectories(): string[];
    /**
     * Add a file naming pattern to track
     * @param pattern The file naming pattern (e.g., "component.tsx")
     */
    addFilePattern(pattern: string): void;
    /**
     * Get all tracked file naming patterns
     * @returns Array of file naming patterns
     */
    getFilePatterns(): string[];
    /**
     * Clear all tracked preferences
     */
    clear(): void;
}
