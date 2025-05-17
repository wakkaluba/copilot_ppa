/**
 * Represents an entry point in a webpack configuration
 */
export interface WebpackEntry {
  /** The name of the entry point */
  name: string;
  /** The path to the entry point file */
  path: string;
}

/**
 * Represents the output configuration in a webpack configuration
 */
export interface WebpackOutput {
  /** The output directory path */
  path: string;
  /** The output filename pattern */
  filename: string;
  /** Optional public path for assets */
  publicPath?: string;
}

/**
 * Represents a loader configuration in a webpack configuration
 */
export interface WebpackLoader {
  /** The name of the loader */
  name: string;
  /** The file pattern test for the loader */
  test: string;
  /** Loader-specific options */
  options: Record<string, unknown>;
}

/**
 * Represents a plugin in a webpack configuration
 */
export interface WebpackPlugin {
  /** The name of the plugin */
  name: string;
  /** A description of what the plugin does */
  description: string;
}

/**
 * Represents an optimization suggestion for a webpack configuration
 */
export interface WebpackOptimization {
  /** The title of the optimization */
  title: string;
  /** A description of what the optimization does and why it's beneficial */
  description: string;
  /** The code snippet to implement the optimization */
  code: string;
}

/**
 * Represents the complete analysis of a webpack configuration file
 */
export interface WebpackConfigAnalysis {
  /** The entry points defined in the config */
  entryPoints: WebpackEntry[];
  /** The output configuration */
  output: WebpackOutput;
  /** The loaders configured */
  loaders: WebpackLoader[];
  /** The plugins being used */
  plugins: WebpackPlugin[];
  /** The raw content of the config file */
  content: string;
  /** Generated optimization suggestions */
  optimizationSuggestions: WebpackOptimization[];
}

export interface WebpackConfigContent {
  content: string;
  entryPoints: any[];
  output: any;
  loaders: any[];
  plugins: any[];
}
