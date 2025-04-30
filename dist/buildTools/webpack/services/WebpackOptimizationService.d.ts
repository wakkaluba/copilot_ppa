import { ILogger } from '../../../services/logging/ILogger';
import { WebpackEntry, WebpackLoader, WebpackOptimization, WebpackPlugin } from '../types';
export declare class WebpackOptimizationService {
    private readonly logger;
    constructor(logger?: ILogger);
    /**
     * Generates optimization suggestions for a webpack configuration
     */
    generateSuggestions(content: string, entryPoints: WebpackEntry[], loaders: WebpackLoader[], plugins: WebpackPlugin[]): Promise<WebpackOptimization[]>;
}
