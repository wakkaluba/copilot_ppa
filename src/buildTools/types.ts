import * as vscode from 'vscode';

/**
 * Supported build tool types
 */
export enum BuildToolType {
    Webpack = 'webpack',
    Rollup = 'rollup',
    Vite = 'vite'
}

/**
 * Base interface for any build configuration analysis
 */
export interface BuildConfigAnalysis {
    configPath: string;
    optimizationSuggestions: OptimizationSuggestion[];
}

/**
 * Optimization suggestion for build config
 */
export interface OptimizationSuggestion {
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
export interface BuildScriptOptimization {
    title: string;
    description: string;
    benefit: string;
    before: string;
    after: string;
}

/**
 * Interface for bundle analysis results
 */
export interface BundleAnalysisResult {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    otherSize: number;
    files: BundleFile[];
    recommendations: BundleRecommendation[];
}

/**
 * Interface for individual file in a bundle analysis
 */
export interface BundleFile {
    path: string;
    size: number;
    type: 'js' | 'css' | 'image' | 'other';
}

/**
 * Interface for bundle optimization recommendation
 */
export interface BundleRecommendation {
    title: string;
    description: string;
    potentialSavings?: number;
}

/**
 * Interface to be implemented by all build tool config managers
 */
export interface BuildToolConfigManager {
    detectConfigs(workspacePath: string): Promise<string[]>;
    analyzeConfig(configPath: string): Promise<BuildConfigAnalysis>;
    generateOptimizations(configPath: string): Promise<OptimizationSuggestion[]>;
    validateConfig?(configPath: string): Promise<ValidationResult>;
}

/**
 * Interface for configuration validation results
 */
export interface ValidationResult {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
}

/**
 * Interface for validation errors
 */
export interface ValidationError {
    message: string;
    line?: number;
    column?: number;
    severity: 'error';
}

/**
 * Interface for validation warnings
 */
export interface ValidationWarning {
    message: string;
    line?: number;
    column?: number;
    severity: 'warning';
}