/**
 * Represents a build configuration in a Vite configuration
 */
export interface ViteBuildConfig {
    /** The output directory path */
    outDir?: string;
    /** The target environment */
    target?: string | string[];
    /** Whether to minify the output */
    minify?: boolean | 'terser' | 'esbuild';
    /** Whether to enable source maps */
    sourcemap?: boolean | 'inline' | 'hidden';
    /** CSS code splitting options */
    cssCodeSplit?: boolean;
    /** Whether to enable CSS modules */
    cssModules?: boolean;
    /** Asset inline limit in bytes */
    assetsInlineLimit?: number;
    /** Custom rollup options */
    rollupOptions?: Record<string, unknown>;
}
/**
 * Represents a plugin in a Vite configuration
 */
export interface VitePlugin {
    /** The name of the plugin */
    name: string;
    /** A description of what the plugin does */
    description: string;
    /** Plugin-specific options */
    options?: Record<string, unknown>;
}
/**
 * Represents optimization options in a Vite configuration
 */
export interface ViteOptimizationOptions {
    /** Whether to enable dependency pre-bundling */
    deps?: {
        entries?: string[];
        exclude?: string[];
        include?: string[];
    };
    /** Whether to enable build-time optimizations */
    build?: {
        target?: string;
        minify?: boolean;
        cssCodeSplit?: boolean;
        chunkSizeWarningLimit?: number;
    };
}
/**
 * Represents an optimization suggestion for a Vite configuration
 */
export interface ViteOptimization {
    /** The title of the optimization */
    title: string;
    /** A description of what the optimization does and why it's beneficial */
    description: string;
    /** The code snippet to implement the optimization */
    code: string;
}
/**
 * Represents the complete analysis of a Vite configuration file
 */
export interface ViteConfigAnalysis {
    /** The build configuration */
    build: ViteBuildConfig;
    /** The plugins being used */
    plugins: VitePlugin[];
    /** Optimization options */
    optimizationOptions: ViteOptimizationOptions;
    /** The raw content of the config file */
    content: string;
    /** Generated optimization suggestions */
    optimizationSuggestions: string[];
}
/**
 * Interface for the Vite configuration manager
 */
export interface IViteConfigManager {
    detectConfigs(workspacePath: string): Promise<string[]>;
    analyzeConfig(configPath: string): Promise<ViteConfigAnalysis>;
    validateConfig(configPath: string): Promise<boolean>;
    generateOptimizations(configPath: string): Promise<string[]>;
    detectFramework(configPath: string): Promise<string | null>;
}
