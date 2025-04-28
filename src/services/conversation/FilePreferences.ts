export class FilePreferences {
  private fileExtensions: Set<string> = new Set();
  private directories: Set<string> = new Set();
  private filePatterns: Set<string> = new Set();

  /**
   * Add a file extension to track
   * @param extension The file extension without dot (e.g., "ts", "js")
   */
  public addFileExtension(extension: string): void {
    this.fileExtensions.add(extension.toLowerCase().replace(/^\./, ''));
  }

  /**
   * Get all tracked file extensions
   * @returns Array of file extensions
   */
  public getFileExtensions(): string[] {
    return Array.from(this.fileExtensions);
  }

  /**
   * Add a directory path to track
   * @param directory The directory path
   */
  public addDirectory(directory: string): void {
    this.directories.add(directory.replace(/\\/g, '/'));
  }

  /**
   * Get all tracked directories
   * @returns Array of directory paths
   */
  public getDirectories(): string[] {
    return Array.from(this.directories);
  }

  /**
   * Add a file naming pattern to track
   * @param pattern The file naming pattern (e.g., "component.tsx")
   */
  public addFilePattern(pattern: string): void {
    this.filePatterns.add(pattern);
  }

  /**
   * Get all tracked file naming patterns
   * @returns Array of file naming patterns
   */
  public getFilePatterns(): string[] {
    return Array.from(this.filePatterns);
  }

  /**
   * Clear all tracked preferences
   */
  public clear(): void {
    this.fileExtensions.clear();
    this.directories.clear();
    this.filePatterns.clear();
  }
}