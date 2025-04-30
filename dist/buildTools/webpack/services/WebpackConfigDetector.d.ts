import { ILogger } from '../../../services/logging/ILogger';
export declare class WebpackConfigDetector {
    private readonly configPatterns;
    private readonly logger;
    constructor(logger?: ILogger);
    /**
     * Detects webpack configuration files in the given directory
     * @param workspacePath Directory to search for webpack configs
     * @returns Array of absolute paths to webpack config files
     */
    detectConfigs(workspacePath: string): Promise<string[]>;
    /**
     * Finds files matching the given pattern in the workspace
     * @param pattern Glob pattern to match
     * @param cwd Directory to search in
     */
    private findFiles;
    /**
     * Validates if a file is a webpack config
     * @param filePath Path to the file to validate
     * @returns true if the file appears to be a webpack config
     */
    validateConfigFile(filePath: string): Promise<boolean>;
}
