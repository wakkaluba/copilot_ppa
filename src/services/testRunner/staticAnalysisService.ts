import * as vscode from 'vscode';
import * as path from 'path';
import { TestResult } from './testRunnerTypes';
import { StaticAnalysisServiceImpl } from '../../services/testRunner/services/StaticAnalysisServiceImpl';
import { ILogger } from '../logging/ILogger';

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
 * Interface for static analysis results
 */
export interface StaticAnalysisResult {
    /** Analysis issues found */
    issues: StaticAnalysisIssue[];
    /** Total count of issues */
    issueCount: number;
    /** Tool-specific details */
    toolDetails?: Record<string, unknown>;
}

/**
 * Interface for a static analysis issue
 */
export interface StaticAnalysisIssue {
    /** Issue message */
    message: string;
    /** File path where issue was found */
    filePath: string;
    /** Line number where issue was found */
    line: number;
    /** Column number where issue was found */
    column?: number;
    /** Issue severity */
    severity: 'error' | 'warning' | 'info';
    /** Rule or check that found the issue */
    rule?: string;
    /** Suggested fix if available */
    fix?: string;
}

/**
 * Service for performing static code analysis
 */
export class StaticAnalysisService implements vscode.Disposable {
    private readonly service: StaticAnalysisServiceImpl;
    private readonly logger: ILogger;
    private readonly outputChannel: vscode.OutputChannel;

    constructor(logger: ILogger) {
        this.logger = logger;
        this.outputChannel = vscode.window.createOutputChannel('Static Analysis');
        this.service = new StaticAnalysisServiceImpl(this.logger, this.outputChannel);
    }

    /**
     * Run ESLint analysis
     */
    public async runESLint(options: StaticAnalysisOptions): Promise<TestResult> {
        try {
            this.logger.debug('Running ESLint analysis');
            return await this.service.runESLint(options);
        } catch (error) {
            this.logger.error('ESLint analysis failed:', error);
            return {
                success: false,
                message: `ESLint analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                suites: [],
                totalTests: 0,
                passed: 0,
                failed: 1,
                skipped: 0,
                duration: 0,
                timestamp: new Date()
            };
        }
    }

    /**
     * Run Prettier analysis
     */
    public async runPrettier(options: StaticAnalysisOptions): Promise<TestResult> {
        try {
            this.logger.debug('Running Prettier analysis');
            return await this.service.runPrettier(options);
        } catch (error) {
            this.logger.error('Prettier analysis failed:', error);
            return {
                success: false,
                message: `Prettier analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                suites: [],
                totalTests: 0,
                passed: 0,
                failed: 1,
                skipped: 0,
                duration: 0,
                timestamp: new Date()
            };
        }
    }

    /**
     * Run static analysis with specified tool
     */
    public async runAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        try {
            this.validateOptions(options);
            this.logger.info(`Running static analysis with ${options.tool || 'default'} tool`);
            
            const result = await this.service.runAnalysis(options);
            
            if (result.staticAnalysis?.issues?.length > 0) {
                this.logIssues(result.staticAnalysis.issues);
            }
            
            return result;
        } catch (error) {
            this.logger.error('Static analysis failed:', error);
            return {
                success: false,
                message: `Static analysis failed: ${error instanceof Error ? error.message : String(error)}`,
                suites: [],
                totalTests: 0,
                passed: 0,
                failed: 1,
                skipped: 0,
                duration: 0,
                timestamp: new Date()
            };
        }
    }

    /**
     * Validate analysis options
     */
    private validateOptions(options: StaticAnalysisOptions): void {
        if (options.tool && !this.isValidTool(options.tool)) {
            throw new Error(`Unsupported analysis tool: ${options.tool}`);
        }

        if (options.path && !path.isAbsolute(options.path)) {
            options.path = path.resolve(options.path);
        }

        if (options.configPath && !path.isAbsolute(options.configPath)) {
            options.configPath = path.resolve(options.configPath);
        }
    }

    /**
     * Check if tool is supported
     */
    private isValidTool(tool: string): tool is StaticAnalysisTool {
        return ['eslint', 'tslint', 'prettier', 'stylelint', 'sonarqube', 'custom'].includes(tool);
    }

    /**
     * Log analysis issues
     */
    private logIssues(issues: StaticAnalysisIssue[]): void {
        this.outputChannel.appendLine('\n--- Static Analysis Issues ---\n');
        
        for (const issue of issues) {
            const location = `${issue.filePath}:${issue.line}${issue.column ? `:${issue.column}` : ''}`;
            const severity = issue.severity.toUpperCase();
            this.outputChannel.appendLine(`[${severity}] ${location} - ${issue.message}`);
            
            if (issue.rule) {
                this.outputChannel.appendLine(`  Rule: ${issue.rule}`);
            }
            
            if (issue.fix) {
                this.outputChannel.appendLine(`  Suggestion: ${issue.fix}`);
            }
            
            this.outputChannel.appendLine('');
        }
    }

    /**
     * Dispose of resources
     */
    public dispose(): void {
        this.outputChannel.dispose();
        this.service.dispose();
    }
}
