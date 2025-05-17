
/**
 * Supported build tool types
 */
export enum BuildToolType {
  Webpack = 'webpack',
  Rollup = 'rollup',
  Vite = 'vite',
}

/**
 * Base interface for any build configuration analysis
 */
export interface IBuildConfigAnalysis {
  configPath: string;
  optimizationSuggestions: IOptimizationSuggestion[];
}

/**
 * Optimization suggestion for build config
 */
export interface IOptimizationSuggestion {
  title: string;
  description: string;
  code: string;
  benefit?: string;
  complexity: 'low' | 'medium' | 'high';
  beforeAfter?: {
    before: string;
    after: string;
  };
}

/**
 * Interface for build script optimization
 */
export interface IBuildScriptOptimization {
  title: string;
  description: string;
  benefit: string;
  before: string;
  after: string;
}

/**
 * Interface for bundle analysis results
 */
export interface IBundleAnalysisResult {
  totalSize: number;
  jsSize: number;
  cssSize: number;
  imageSize: number;
  otherSize: number;
  files: IBundleFile[];
  recommendations: IBundleRecommendation[];
}

/**
 * Interface for individual file in a bundle analysis
 */
export interface IBundleFile {
  path: string;
  size: number;
  type: 'js' | 'css' | 'image' | 'other';
}

/**
 * Interface for bundle optimization recommendation
 */
export interface IBundleRecommendation {
  title: string;
  description: string;
  potentialSavings?: number;
}

/**
 * Interface to be implemented by all build tool config managers
 */
export interface IBuildToolConfigManager {
  detectConfigs(workspacePath: string): Promise<string[]>;
  analyzeConfig(configPath: string): Promise<IBuildConfigAnalysis>;
  generateOptimizations(configPath: string): Promise<IOptimizationSuggestion[]>;
  validateConfig?(configPath: string): Promise<IValidationResult>;
}

/**
 * Interface for configuration validation results
 */
export interface IValidationResult {
  isValid: boolean;
  errors: IValidationError[];
  warnings: IValidationWarning[];
}

/**
 * Interface for validation errors
 */
export interface IValidationError {
  message: string;
  line?: number;
  column?: number;
  severity: 'error';
}

/**
 * Interface for validation warnings
 */
export interface IValidationWarning {
  message: string;
  line?: number;
  column?: number;
  severity: 'warning';
}
