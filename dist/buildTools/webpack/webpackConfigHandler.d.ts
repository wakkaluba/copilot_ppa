/**
 * Handles Webpack configuration files
 */
export declare class WebpackConfigHandler {
    private configFileNames;
    /**
     * Checks if a Webpack configuration file exists in the workspace
     */
    isConfigPresent(): Promise<boolean>;
    /**
     * Opens the Webpack configuration file in the editor
     */
    openConfig(): Promise<void>;
    /**
     * Creates a new Webpack configuration file
     */
    private createNewConfig;
    /**
     * Returns a template for a new Webpack configuration file
     */
    private getWebpackConfigTemplate;
    /**
     * Provides suggestions for optimizing Webpack configuration
     */
    suggestOptimizations(configPath: string): Promise<void>;
}
