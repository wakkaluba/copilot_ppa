import { ILogger } from '../../../services/logging/ILogger';
import { IRollupConfigDetector } from '../types';
export declare class RollupConfigDetector implements IRollupConfigDetector {
    private readonly configPatterns;
    private readonly logger;
    constructor(logger?: ILogger);
    /**
     * Detects rollup configuration files in the given directory
     * @param workspacePath Directory to search for rollup configs
     * @returns Array of absolute paths to rollup config files
     */
    detectConfigs(workspacePath: string): Promise<string[]>;
    /**
     * Finds files matching the given pattern in the workspace
     * @param pattern Glob pattern to match
     * @param cwd Directory to search in
     */
    private findFiles;
    /**
     * Validates if a file is a rollup config
     * @param filePath Path to the file to validate
     * @returns true if the file appears to be a rollup config
     */
    validateConfigFile(filePath: string): Promise<boolean>;
    /**
     * Gets the default config pattern for a given language
     * @param language The programming language (js, ts, etc.)
     * @returns The default config pattern for that language
     */
    getDefaultConfigPattern(language: string): string;
}
