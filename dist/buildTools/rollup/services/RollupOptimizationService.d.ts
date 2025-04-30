import { ILogger } from '../../../services/logging/ILogger';
import { RollupInput, RollupOutput, RollupPlugin, RollupOptimization } from '../types';
export declare class RollupOptimizationService {
    private readonly logger;
    constructor(logger?: ILogger);
    /**
     * Generates optimization suggestions for a rollup configuration
     */
    generateSuggestions(content: string, input: RollupInput[], output: RollupOutput[], plugins: RollupPlugin[]): Promise<RollupOptimization[]>;
}
