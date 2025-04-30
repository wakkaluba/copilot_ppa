import { ILogger } from '../../../services/logging/ILogger';
import { WebpackConfigAnalysis } from '../types';
export declare class WebpackConfigAnalyzer {
    private readonly logger;
    constructor(logger?: ILogger);
    /**
     * Analyzes a webpack configuration file
     * @param configPath Path to the webpack config file
     */
    analyze(configPath: string): Promise<WebpackConfigAnalysis>;
    private extractEntryPoints;
    private extractOutput;
    private extractPathValue;
    private extractLoaders;
    private extractRuleBlocks;
    private extractTest;
    private extractLoaderNames;
    private extractLoaderOptions;
    private extractPlugins;
    private getPluginDescription;
}
