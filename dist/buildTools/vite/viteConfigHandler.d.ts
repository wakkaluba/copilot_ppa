/**
 * Handles Vite configuration files
 */
export declare class ViteConfigHandler {
    private configFileNames;
    /**
     * Checks if a Vite configuration file exists in the workspace
     */
    isConfigPresent(): Promise<boolean>;
    /**
     * Opens the Vite configuration file in the editor
     */
    openConfig(): Promise<void>;
    /**
     * Creates a new Vite configuration file
     */
    private createNewConfig;
    /**
     * Returns a template for a new Vite configuration file
     */
    private getViteConfigTemplate;
    /**
     * Provides suggestions for optimizing Vite configuration
     */
    suggestOptimizations(configPath: string): Promise<void>;
}
