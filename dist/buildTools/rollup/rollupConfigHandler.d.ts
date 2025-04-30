/**
 * Handles Rollup configuration files
 */
export declare class RollupConfigHandler {
    private readonly configFileNames;
    /**
     * Checks if a Rollup configuration file exists in the workspace
     * @throws {ConfigValidationError} If no workspace folders are open
     */
    isConfigPresent(): Promise<boolean>;
    /**
     * Opens the Rollup configuration file in the editor
     * @throws {ConfigValidationError} If no workspace folders are open or no config files exist
     */
    openConfig(): Promise<void>;
    /**
     * Creates a new Rollup configuration file
     * @throws {ConfigValidationError} If no workspace folders are open or file already exists
     */
    private createNewConfig;
    /**
     * Returns a template for a new Rollup configuration file
     */
    private getRollupConfigTemplate;
    /**
     * Provides suggestions for optimizing Rollup configuration
     * @throws {ConfigValidationError} If the config file doesn't exist
     */
    suggestOptimizations(configPath: string): Promise<void>;
}
