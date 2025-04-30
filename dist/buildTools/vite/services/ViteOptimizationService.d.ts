import { ILogger } from '../../../services/logging/ILogger';
import { ViteBuildConfig, VitePlugin, ViteOptimizationOptions } from '../types';
export declare class ViteOptimizationService {
    private readonly logger;
    constructor(logger: ILogger);
    /**
     * Generates optimization suggestions for a Vite configuration
     */
    generateSuggestions(content: string, build: ViteBuildConfig, plugins: VitePlugin[], optimizationOptions: ViteOptimizationOptions): Promise<string[]>;
    private checkBuildOptimizations;
    private checkPluginOptimizations;
    private checkDependencyOptimizations;
    private checkPerformanceOptimizations;
}
