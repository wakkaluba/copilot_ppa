export declare class BuildScriptOptimizer {
    /**
     * Analyzes and optimizes a build script from package.json
     */
    optimizeScript(scriptName: string, scriptCommand: string): Promise<any[]>;
}
