import { ILogger } from '../../../services/logging/ILogger';
import { IRollupConfigManager } from '../types';
/**
 * Service responsible for UI interactions related to Rollup configuration
 */
export declare class RollupConfigUIService {
    private readonly logger;
    private readonly configManager;
    constructor(logger: ILogger, configManager: IRollupConfigManager);
    /**
     * Opens the Rollup configuration file in the editor
     * @throws {Error} If no config files exist
     */
    openConfig(): Promise<void>;
    /**
     * Creates a new Rollup configuration file
     */
    createNewConfig(): Promise<void>;
    /**
     * Provides suggestions for optimizing Rollup configuration
     */
    suggestOptimizations(configPath: string): Promise<void>;
    /**
     * Returns a template for a new Rollup configuration file
     */
    private getRollupConfigTemplate;
}
