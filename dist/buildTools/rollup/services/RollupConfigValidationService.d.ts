import { ILogger } from '../../../services/logging/ILogger';
import { RollupConfigAnalysis } from '../types';
/**
 * Service responsible for validating Rollup configuration files and paths
 */
export declare class RollupConfigValidationService {
    private readonly logger;
    constructor(logger: ILogger);
    /**
     * Validates the configuration analysis results
     * @throws {ConfigValidationError} If validation fails
     */
    validateConfig(analysis: RollupConfigAnalysis): void;
    /**
     * Validates a workspace path
     * @throws {ConfigValidationError} If the path is invalid
     */
    validateWorkspacePath(workspacePath: string): void;
    /**
     * Validates a config file path
     * @throws {ConfigValidationError} If the path is invalid
     */
    validateConfigPath(configPath: string): void;
}
