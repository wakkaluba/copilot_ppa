import { BuildToolsManager } from '../buildToolsManager';
import { BuildScriptOptimization } from './types';
import { Logger } from '../../utils/logger';
export declare class BuildScriptOptimizer {
    private readonly logger;
    private readonly generator;
    private readonly analyzer;
    private readonly ui;
    constructor(buildTools: BuildToolsManager, loggerFactory?: (category: string) => Logger);
    optimizeScript(scriptName: string, scriptCommand: string): Promise<BuildScriptOptimization[]>;
    private wrapError;
}
