export type {
    IOptimizationSuggestion as ConfigOptimization,
    IValidationError,
    IValidationResult,
    IValidationWarning
} from '../types';

export interface IRollupInput {
  name: string;
  path: string;
}

export interface IRollupOutput {
  format: string;
  file: string;
  name?: string;
  sourcemap?: boolean;
}

export interface IRollupPlugin {
  name: string;
  description: string;
}

export interface IRollupConfigAnalysis {
  input: IRollupInput[];
  output: IRollupOutput[];
  plugins: IRollupPlugin[];
  external: string[];
  content: string;
  optimizationSuggestions: any[]; // Adjusted to remove RollupOptimization
}

/**
 * Interface for the service that detects Rollup configuration files
 */
export interface IRollupConfigDetector {
  /**
   * Detects Rollup configuration files in the given directory
   * @throws {ConfigValidationError} If workspace path is invalid
   * @throws {Error} If detection fails
   */
  detectConfigs(workspacePath: string): Promise<string[]>;
}

/**
 * Interface for the service that analyzes Rollup configuration files
 */
export interface IRollupConfigAnalyzer {
  /**
   * Analyzes a Rollup configuration file
   * @throws {ConfigValidationError} If the config is invalid
   * @throws {Error} If analysis fails
   */
  analyze(configPath: string): Promise<IRollupConfigAnalysis>;
}

/**
 * Interface for the service that generates optimization suggestions for Rollup configurations
 */
export interface IRollupOptimizationService {
  /**
   * Generates optimization suggestions for a Rollup configuration
   */
  generateOptimizations(
    content: string,
    inputs: IRollupInput[],
    outputFormats: string[],
    pluginNames: string[],
  ): any[]; // Adjusted to remove RollupOptimization
}

/**
 * Interface for the service that validates Rollup configuration files and paths
 */
export interface IRollupConfigValidationService {
  /**
   * Validates the configuration analysis results
   * @throws {ConfigValidationError} If validation fails
   */
  validateConfig(analysis: IRollupConfigAnalysis): void;

  /**
   * Validates a workspace path
   * @throws {ConfigValidationError} If the path is invalid
   */
  validateWorkspacePath(workspacePath: string): void;

  /**
   * Validates a config file path
   * @throws {ConfigValidationError} If the path is invalid
   */
  validateConfigPath(configPath: string): void;

  /**
   * Validates if a config file exists
   * @param configPath Path to check
   */
  validateFileExists(configPath: string): Promise<boolean>;

  /**
   * Validates if a config file is syntactically correct
   * @param configPath Path to the rollup config file
   */
  validateSyntax(configPath: string): Promise<boolean>;

  /**
   * Performs a deep validation of rollup configuration
   * @param config Rollup configuration object
   */
  validateConfig(config: RollupOptions): Promise<void>;
}

/**
 * Interface for the Rollup configuration manager
 */
export interface IRollupConfigManager {
  /**
   * Detects Rollup configuration files in the given directory
   * @throws {ConfigValidationError} If workspace path is invalid
   * @throws {Error} If detection fails
   */
  detectConfigs(workspacePath: string): Promise<string[]>;

  /**
   * Analyzes a Rollup configuration file and validates its structure
   * @throws {ConfigValidationError} If the configuration is invalid
   * @throws {Error} If analysis fails
   */
  analyzeConfig(configPath: string): Promise<IRollupConfigAnalysis>;

  /**
   * Generates optimization suggestions for a Rollup configuration
   * @throws {ConfigValidationError} If the config path is invalid
   * @throws {Error} If optimization generation fails
   */
  generateOptimizations(configPath: string): Promise<any[]>; // Adjusted to remove RollupOptimization

  /**
   * Validates a rollup configuration file
   * @param configPath Path to the rollup config file
   */
  validateConfig(configPath: string): Promise<boolean>;

  /**
   * Detects rollup configuration files in a directory
   * @param directory Directory to search in
   */
  detectConfigs(directory: string): Promise<string[]>;

  /**
   * Loads a rollup configuration
   * @param configPath Path to the rollup config file
   */
  loadConfig(configPath: string): Promise<RollupOptions>;

  /**
   * Generates optimization suggestions for a rollup config
   * @param configPath Path to the rollup config file
   */
  generateOptimizations(configPath: string): Promise<any[]>; // Adjusted to remove RollupOptimization
}

/**
 * Interface for the service that provides UI operations for Rollup configurations
 */
export interface IRollupConfigUIService {
  /**
   * Opens a rollup configuration file in the editor
   */
  openConfig(): Promise<void>;

  /**
   * Creates a new rollup configuration file
   */
  createNewConfig(): Promise<void>;

  /**
   * Suggests optimizations for a rollup config
   * @param configPath Path to the rollup config file
   */
  suggestOptimizations(configPath: string): Promise<void>;
}

// Fallback RollupOptions type if 'rollup' is not installed
export interface RollupOptions {
  input?: string | string[];
  output?: any;
  plugins?: any[];
  [key: string]: any;
}
