/**
 * Represents an input configuration in a rollup configuration
 */
export interface RollupInput {
    /** The name of the input entry point */
    name: string;
    /** The path to the input file */
    path: string;
    /** External dependencies */
    external?: string[];
}

/**
 * Represents an output configuration in a rollup configuration
 */
export interface RollupOutput {
    /** The output file path */
    file?: string;
    /** The output directory path */
    dir?: string;
    /** The output format (e.g., 'es', 'cjs', 'umd', etc.) */
    format: string;
    /** The name for UMD bundles */
    name?: string;
    /** Source map generation options */
    sourcemap?: boolean | 'inline' | 'hidden';
}

/**
 * Represents a plugin in a rollup configuration
 */
export interface RollupPlugin {
    /** The name of the plugin */
    name: string;
    /** A description of what the plugin does */
    description: string;
}

/**
 * Represents an optimization suggestion for a rollup configuration
 */
export interface RollupOptimization {
    /** The title of the optimization */
    title: string;
    /** A description of what the optimization does and why it's beneficial */
    description: string;
    /** The code snippet to implement the optimization */
    code: string;
}

/**
 * Represents the complete analysis of a rollup configuration file
 */
export interface RollupConfigAnalysis {
    /** The input configurations */
    input: RollupInput[];
    /** The output configurations */
    output: RollupOutput[];
    /** The plugins being used */
    plugins: RollupPlugin[];
    /** The raw content of the config file */
    content: string;
    /** Generated optimization suggestions */
    optimizationSuggestions: string[];
}

/**
 * Interface for the rollup configuration manager
 */
export interface IRollupConfigManager {
    detectConfigs(workspacePath: string): Promise<string[]>;
    analyzeConfig(configPath: string): Promise<RollupConfigAnalysis>;
    validateConfig(configPath: string): Promise<boolean>;
    generateOptimizations(configPath: string): Promise<string[]>;
}