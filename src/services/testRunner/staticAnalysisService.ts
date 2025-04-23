import * as vscode from 'vscode';
import { inject, injectable } from 'inversify';
import { ILogger } from '../../logging/ILogger';
import { IStaticAnalysisService } from './services/interfaces/IStaticAnalysisService';
import { StaticAnalysisOptions, StaticAnalysisTool } from './services/StaticAnalysisTool';
import { TestResult } from './testRunnerTypes';
import { StaticAnalysisExecutor } from './services/StaticAnalysisExecutor';

@injectable()
export class StaticAnalysisService implements IStaticAnalysisService {
    private readonly executor: StaticAnalysisExecutor;
    private readonly outputChannel: vscode.OutputChannel;

    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(StaticAnalysisExecutor) executor: StaticAnalysisExecutor
    ) {
        this.executor = executor;
        this.outputChannel = vscode.window.createOutputChannel('Static Analysis');
    }

    public async runESLint(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.runAnalysis({ ...options, tool: 'eslint' });
    }

    public async runPrettier(options: StaticAnalysisOptions): Promise<TestResult> {
        return this.runAnalysis({ ...options, tool: 'prettier' });
    }

    public async runAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        try {
            this.validateOptions(options);
            this.logger.info(`Running static analysis with ${options.tool || 'default'} tool`);

            const analysis = await this.executor.execute(options);
            
            if (analysis.issues.length > 0) {
                this.logIssues(analysis.issues);
            }

            return {
                success: analysis.issues.length === 0,
                message: `Found ${analysis.issues.length} issues`,
                suites: [{
                    id: options.tool || 'static-analysis',
                    name: 'Static Analysis',
                    tests: analysis.issues.map(issue => ({
                        id: `${issue.filePath}:${issue.line}`,
                        name: `${issue.message} (${issue.filePath}:${issue.line})`,
                        status: 'failed' as const,
                        duration: 0,
                        error: issue.message
                    })),
                    suites: []
                }],
                totalTests: analysis.issues.length,
                passed: 0,
                failed: analysis.issues.length,
                skipped: 0,
                duration: 0,
                timestamp: new Date(),
                staticAnalysis: analysis
            };
        } catch (error) {
            this.logger.error('Static analysis failed:', error);
            return this.createErrorResult(error);
        }
    }

    private createErrorResult(error: unknown): TestResult {
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

    private validateOptions(options: StaticAnalysisOptions): void {
        if (options.tool && !this.isValidTool(options.tool)) {
            throw new Error(`Unsupported analysis tool: ${options.tool}`);
        }
    }

    private isValidTool(tool: string): tool is StaticAnalysisTool {
        return ['eslint', 'tslint', 'prettier', 'stylelint', 'sonarqube', 'custom'].includes(tool);
    }

    private logIssues(issues: StaticAnalysisResult['issues']): void {
        this.outputChannel.appendLine('\n--- Static Analysis Issues ---\n');
        
        for (const issue of issues) {
            const location = `${issue.filePath}:${issue.line}${issue.column ? `:${issue.column}` : ''}`;
            const severity = issue.severity.toUpperCase();
            this.outputChannel.appendLine(`[${severity}] ${location} - ${issue.message}`);
            
            if (issue.ruleId) {
                this.outputChannel.appendLine(`  Rule: ${issue.ruleId}`);
            }
            
            if (issue.fix) {
                this.outputChannel.appendLine(`  Suggestion: ${issue.fix}`);
            }
            
            this.outputChannel.appendLine('');
        }
    }

    public dispose(): void {
        this.outputChannel.dispose();
    }
}
