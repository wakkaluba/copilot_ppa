import { BuildScriptInfo, BuildScriptOptimization } from '../types';
export declare class OptimizationGeneratorService {
    private readonly analyzer;
    constructor();
    generateOptimizations(buildScripts: BuildScriptInfo[], packageJson: any): Promise<BuildScriptOptimization[]>;
    applyOptimizations(packageJson: any, optimizations: BuildScriptOptimization[]): Promise<any>;
    private generateCrossEnvOptimizations;
    private generateParallelizationOptimizations;
    private generateWebpackOptimizations;
    private generateTypeScriptOptimizations;
    private generateCleanupOptimizations;
    private generateCacheOptimizations;
    private generateEnvironmentOptimizations;
}
