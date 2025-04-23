import * as vscode from 'vscode';
import { execSync } from 'child_process';
import { StaticAnalysisTool, StaticAnalysisOptions, StaticAnalysisResult } from './StaticAnalysisTool';
import { ILogger } from '../../logging/ILogger';
import { injectable, inject } from 'inversify';

@injectable()
export class StaticAnalysisExecutor implements vscode.Disposable {
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject('OutputChannel') private readonly outputChannel: vscode.OutputChannel
    ) {}

    public async execute(options: StaticAnalysisOptions): Promise<StaticAnalysisResult> {
        try {
            const tool = this.resolveTool(options);
            const command = this.buildCommand(tool, options);
            const result = await this.executeCommand(command, options.path);
            return this.processResult(result, tool);
        } catch (error) {
            this.logger.error('Static analysis execution failed:', error);
            throw error;
        }
    }

    private resolveTool(options: StaticAnalysisOptions): string {
        return options.tool || 'eslint';
    }

    private buildCommand(tool: string, options: StaticAnalysisOptions): string {
        switch (tool) {
            case 'eslint':
                return `eslint ${options.files?.join(' ') || '.'} -f json`;
            case 'prettier':
                return `prettier --check ${options.files?.join(' ') || '.'}`;
            case 'stylelint':
                return `stylelint ${options.files?.join(' ') || '**/*.css'} --formatter json`;
            case 'sonarqube':
                return `sonar-scanner ${this.buildSonarOptions(options)}`;
            default:
                throw new Error(`Unsupported static analysis tool: ${tool}`);
        }
    }

    private buildSonarOptions(options: StaticAnalysisOptions): string {
        const config = options.config || {};
        return Object.entries(config)
            .map(([key, value]) => `-D${key}=${value}`)
            .join(' ');
    }

    private async executeCommand(command: string, path: string): Promise<string> {
        return new Promise((resolve, reject) => {
            execSync(command, { cwd: path, encoding: 'utf8' }, (error, stdout, stderr) => {
                if (error) {
                    reject(error);
                } else {
                    resolve(stdout);
                }
            });
        });
    }

    private processResult(output: string, tool: string): StaticAnalysisResult {
        try {
            switch (tool) {
                case 'eslint':
                    return this.processESLintOutput(output);
                case 'prettier':
                    return this.processPrettierOutput(output);
                case 'stylelint':
                    return this.processStylelintOutput(output);
                case 'sonarqube':
                    return this.processSonarQubeOutput(output);
                default:
                    throw new Error(`Unsupported tool: ${tool}`);
            }
        } catch (error) {
            this.logger.error(`Error processing ${tool} output:`, error);
            throw error;
        }
    }

    private processESLintOutput(output: string): StaticAnalysisResult {
        const results = JSON.parse(output);
        const issues = results.flatMap((result: any) => 
            result.messages.map((msg: any) => ({
                filePath: result.filePath,
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId || 'unknown',
                severity: msg.severity === 2 ? 'error' : 'warning',
                fix: msg.fix
            }))
        );

        return {
            raw: output,
            issueCount: issues.length,
            issues
        };
    }

    private processPrettierOutput(output: string): StaticAnalysisResult {
        // Prettier outputs nothing if files are formatted correctly
        const issues = output.split('\n')
            .filter(line => line.trim())
            .map(line => ({
                filePath: line.trim(),
                line: 1,
                column: 1,
                message: 'File is not properly formatted',
                ruleId: 'prettier/format',
                severity: 'warning'
            }));

        return {
            raw: output,
            issueCount: issues.length,
            issues
        };
    }

    private processStylelintOutput(output: string): StaticAnalysisResult {
        const results = JSON.parse(output);
        const issues = results.flatMap((result: any) =>
            result.warnings.map((warning: any) => ({
                filePath: result.source,
                line: warning.line,
                column: warning.column,
                message: warning.text,
                ruleId: warning.rule,
                severity: warning.severity
            }))
        );

        return {
            raw: output,
            issueCount: issues.length,
            issues
        };
    }

    private processSonarQubeOutput(output: string): StaticAnalysisResult {
        const results = JSON.parse(output);
        const issues = results.issues.map((issue: any) => ({
            filePath: issue.component,
            line: issue.line,
            column: issue.textRange?.startLine || 1,
            message: issue.message,
            ruleId: issue.rule,
            severity: issue.severity,
            category: issue.type
        }));

        return {
            raw: output,
            issueCount: issues.length,
            issues
        };
    }

    public dispose(): void {
        // Nothing to dispose
    }
}
