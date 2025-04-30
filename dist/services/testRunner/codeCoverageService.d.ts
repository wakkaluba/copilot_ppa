import { TestResult } from './testRunnerTypes';
/**
 * Options for code coverage analysis
 */
export interface CodeCoverageOptions {
    /** Path to analyze */
    path?: string;
    /** Custom command to run */
    command?: string;
    /** Coverage tool to use */
    tool?: 'jest' | 'nyc' | 'istanbul' | 'c8' | 'custom';
    /** Path to coverage report */
    reportPath?: string;
    /** Format of coverage report */
    reportFormat?: 'lcov' | 'json' | 'html' | 'text';
    /** Threshold for minimum coverage */
    threshold?: number;
}
/**
 * Coverage data for a file
 */
export interface FileCoverage {
    /** Path to the file */
    path: string;
    /** Percentage of statements covered */
    statements: number;
    /** Percentage of branches covered */
    branches: number;
    /** Percentage of functions covered */
    functions: number;
    /** Percentage of lines covered */
    lines: number;
    /** Overall coverage percentage */
    overall: number;
    /** Line coverage details */
    lineDetails?: {
        /** Lines that are covered */
        covered: number[];
        /** Lines that are not covered */
        uncovered: number[];
        /** Lines that are partially covered */
        partial: number[];
    };
}
/**
 * Summary of code coverage
 */
export interface CoverageSummary {
    /** Overall coverage percentage */
    overall: number;
    /** Statement coverage percentage */
    statements: number;
    /** Branch coverage percentage */
    branches: number;
    /** Function coverage percentage */
    functions: number;
    /** Line coverage percentage */
    lines: number;
    /** Number of files analyzed */
    totalFiles: number;
    /** Coverage data for individual files */
    files: FileCoverage[];
}
/**
 * Service for analyzing code coverage
 */
export declare class CodeCoverageService {
    private toolService;
    private executor;
    private reportService;
    private parser;
    private thresholdService;
    private outputChannel;
    constructor();
    /**
     * Run code coverage analysis
     */
    runCoverageAnalysis(options: CodeCoverageOptions): Promise<TestResult>;
    /**
     * Clean up resources
     */
    dispose(): void;
}
