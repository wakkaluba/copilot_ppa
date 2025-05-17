/**
 * Represents an entry point in a webpack configuration
 */
export interface IWebpackEntry {
  /** The name of the entry point */
  name: string;
  /** The path to the entry point file */
  path: string;
}

/**
 * Represents the output configuration in a webpack configuration
 */
export interface IWebpackOutput {
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
export interface IWebpackLoader {
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
export interface IWebpackPlugin {
  /** The name of the plugin */
  name: string;
  /** A description of what the plugin does */
  description: string;
}

/**
 * Represents an optimization suggestion for a webpack configuration
 */
export interface IWebpackOptimization {
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
export interface IWebpackConfigAnalysis {
  /** The entry points defined in the config */
  entryPoints: IWebpackEntry[];
  /** The output configuration */
  output: IWebpackOutput;
  /** The loaders configured */
  loaders: IWebpackLoader[];
  /** The plugins being used */
  plugins: IWebpackPlugin[];
  /** The raw content of the config file */
  content: string;
  /** Generated optimization suggestions */
  optimizationSuggestions: IWebpackOptimization[];
}

export interface IWebpackConfigContent {
  content: string;
  entryPoints: any[];
  output: any;
  loaders: any[];
  plugins: any[];
}
