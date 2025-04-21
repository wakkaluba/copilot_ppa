import * as vscode from 'vscode';
import { TestResult } from './testRunnerTypes';
import { StaticAnalysisServiceImpl } from './services/StaticAnalysisService';

/**
 * Supported static code analysis tools
 */
export type StaticAnalysisTool = 'eslint' | 'tslint' | 'prettier' | 'stylelint' | 'sonarqube' | 'custom';

/**
 * Options for static code analysis
 */
export interface StaticAnalysisOptions {
    /** Path to analyze */
    path?: string;
    /** Specific tool to use */
    tool?: StaticAnalysisTool;
    /** Custom command to run */
    command?: string;
    /** Fix issues automatically if possible */
    autoFix?: boolean;
    /** Paths to exclude from analysis */
    exclude?: string[];
    /** Only analyze specific files */
    include?: string[];
    /** Configuration file path */
    configPath?: string;
}

/**
 * Service for performing static code analysis
 */
export class StaticAnalysisService {
    private service: StaticAnalysisServiceImpl;

    constructor() {
        this.service = new StaticAnalysisServiceImpl();
    }

    public async runESLint(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.service.runESLint(options);
    }

    public async runPrettier(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.service.runPrettier(options);
    }

    public async runAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.service.runAnalysis(options);
    }

    public dispose(): void {
        this.service.dispose();
    }
}
