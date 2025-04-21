import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as cp from 'child_process';
import { TestResult } from './testRunnerTypes';
import { CoverageToolService } from './services/CoverageToolService';
import { CommandExecutorService } from './services/CommandExecutorService';
import { CoverageReportService } from './services/CoverageReportService';
import { CoverageParserService } from './services/CoverageParserService';
import { CoverageThresholdService } from './services/CoverageThresholdService';

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
export class CodeCoverageService {
    private toolService: CoverageToolService;
    private executor: CommandExecutorService;
    private reportService: CoverageReportService;
    private parser: CoverageParserService;
    private thresholdService: CoverageThresholdService;
    private outputChannel: vscode.OutputChannel;

    constructor() {
        this.toolService = new CoverageToolService();
        this.executor = new CommandExecutorService();
        this.reportService = new CoverageReportService();
        this.parser = new CoverageParserService();
        this.thresholdService = new CoverageThresholdService();
        this.outputChannel = vscode.window.createOutputChannel('LLM Agent Code Coverage');
    }

    /**
     * Run code coverage analysis
     */
    public async runCoverageAnalysis(options: CodeCoverageOptions): Promise<TestResult> {
        const workspacePath = options.path || vscode.workspace.workspaceFolders?.[0].uri.fsPath;
        if (!workspacePath) {
            return {
                success: false,
                message: 'No workspace folder found'
            };
        }

        this.outputChannel.appendLine(`Running code coverage analysis on ${workspacePath}`);
        this.outputChannel.show();

        const tool = await this.toolService.detectTool(options, workspacePath);
        if (!tool) {
            return {
                success: false,
                message: 'No code coverage tool detected'
            };
        }

        const command = options.command || this.toolService.buildCommand(tool, options);
        this.outputChannel.appendLine(`Running command: ${command}`);

        const result = await this.executor.execute(command, workspacePath, this.outputChannel);

        const reportPath = options.reportPath || this.reportService.findReport(workspacePath, tool, options.reportFormat);
        if (reportPath) {
            const coverageData = await this.parser.parse(reportPath, tool, options.reportFormat);
            if (coverageData) {
                result.codeCoverage = coverageData;
                const passes = this.thresholdService.check(coverageData, options.threshold);
                result.success = result.success && passes.success;
                result.message = passes.message;
            }
        }

        return result;
    }

    /**
     * Clean up resources
     */
    public dispose(): void {
        this.outputChannel.dispose();
    }
}
