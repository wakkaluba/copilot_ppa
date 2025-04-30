import { ILogger } from '../../../services/logging/ILogger';
import { RollupConfigAnalysis, IRollupConfigAnalyzer } from '../types';
export declare class RollupConfigAnalyzer implements IRollupConfigAnalyzer {
    private readonly logger;
    constructor(logger?: ILogger);
    /**
     * Analyzes a Rollup configuration file
     * @throws {ConfigValidationError} If the config is invalid
     * @throws {Error} If analysis fails
     */
    analyze(configPath: string): Promise<RollupConfigAnalysis>;
    private extractInput;
    private extractExternals;
    private extractOutput;
    private parseOutputBlock;
    private extractPlugins;
    private getPluginNameFromImport;
    private getPluginDescription;
    private extractBlocks;
}
