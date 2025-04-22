import { StaticAnalysisService } from '../../services/interfaces/StaticAnalysisService';
import { StaticAnalysisOptions, ESLintIssue } from '../../services/interfaces/StaticAnalysisOptions';
import { TestResult } from '../../testRunner/testTypes';
import { ESLintMock, PrettierMock } from './mockLinters';
import * as fs from 'fs';
import { ESLint } from 'eslint';
import * as prettier from 'prettier';

type PrettierAPI = {
    resolveConfig(file: string): Promise<any>;
    check?(content: string, options: { filepath: string }): Promise<boolean>;
    format?(content: string, options: { filepath: string } & Record<string, any>): Promise<string>;
};

export class StaticAnalysisServiceImpl implements StaticAnalysisService {
    private eslintInstance: ESLint | ESLintMock = new ESLintMock();
    private useRealEslint: boolean = false;
    private useRealPrettier: boolean = false;
    private prettier: PrettierAPI = PrettierMock;
    
    constructor() {
        this.initializeLinters();
    }

    private async initializeLinters(): Promise<void> {
        try {
            this.eslintInstance = new ESLint();
            this.useRealEslint = true;
            console.log('Using real ESLint');
        } catch (error) {
            console.log('ESLint not available, using mock implementation:', error);
            this.eslintInstance = new ESLintMock();
            this.useRealEslint = false;
        }
        
        try {
            // Test if Prettier is available
            await prettier.resolveConfig('test.js');
            this.useRealPrettier = true;
            this.prettier = prettier;
            console.log('Using real Prettier');
        } catch (error) {
            console.log('Prettier not available, using mock implementation:', error);
            this.useRealPrettier = false;
            this.prettier = PrettierMock;
        }
    }

    public async runESLintAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        const issues = await this.lintFiles(options.files);

        return {
            totalTests: issues.length,
            passed: 0,
            failed: issues.length,
            skipped: 0,
            duration: 0,
            suites: [{
                id: 'eslint',
                name: 'ESLint Analysis',
                tests: issues.map(issue => ({
                    id: `${issue.filePath}:${issue.line}`,
                    name: `${issue.message} (${issue.filePath}:${issue.line})`,
                    status: 'failed' as const,
                    duration: 0,
                    error: issue.message
                })),
                suites: []
            }],
            timestamp: new Date(),
            success: issues.length === 0,
            message: `Found ${issues.length} ESLint issues${this.useRealEslint ? '' : ' (using mock implementation)'}`,
            details: this.formatIssuesDetails(issues)
        };
    }

    public async runPrettierAnalysis(options: StaticAnalysisOptions): Promise<TestResult> {
        const unformattedFiles = await this.checkFormatting(options.files);
        
        return {
            totalTests: options.files.length,
            passed: options.files.length - unformattedFiles.length,
            failed: unformattedFiles.length,
            skipped: 0,
            duration: 0,
            suites: [{
                id: 'prettier',
                name: 'Prettier Analysis',
                tests: unformattedFiles.map(file => ({
                    id: file,
                    name: `File not properly formatted: ${file}`,
                    status: 'failed' as const,
                    duration: 0,
                    error: 'File does not match Prettier formatting rules'
                })),
                suites: []
            }],
            timestamp: new Date(),
            success: unformattedFiles.length === 0,
            message: `Found ${unformattedFiles.length} files with formatting issues${this.useRealPrettier ? '' : ' (using mock implementation)'}`,
            details: this.formatPrettierDetails(unformattedFiles)
        };
    }

    private async lintFiles(files: string[]): Promise<ESLintIssue[]> {
        if (this.useRealEslint) {
            try {
                const results = await Promise.all(files.map(file => this.eslintInstance.lintFiles(file)));
                return results.flat().map(result => 
                    result.messages.map((msg: { line: number; column: number; message: string; ruleId: string | null; severity: number }) => ({
                        filePath: result.filePath,
                        line: msg.line,
                        column: msg.column,
                        message: msg.message,
                        ruleId: msg.ruleId || 'unknown',
                        severity: msg.severity
                    } as ESLintIssue))
                ).flat();
            } catch (error) {
                console.error('Error using real ESLint, falling back to mock:', error);
                const mockResults = await (new ESLintMock()).lintFiles(files);
                return this.convertMockResults(mockResults);
            }
        } else {
            const mockResults = await (this.eslintInstance as ESLintMock).lintFiles(files);
            return this.convertMockResults(mockResults);
        }
    }

    private convertMockResults(results: { filePath: string; messages: Array<{ line: number; column: number; message: string; ruleId: string | null; severity: number }> }[]): ESLintIssue[] {
        return results.flatMap(result => 
            result.messages.map(msg => ({
                filePath: result.filePath,
                line: msg.line,
                column: msg.column,
                message: msg.message,
                ruleId: msg.ruleId || 'unknown',
                severity: msg.severity
            } as ESLintIssue))
        );
    }

    private async checkFormatting(files: string[]): Promise<string[]> {
        const unformattedFiles: string[] = [];
        
        for (const file of files) {
            try {
                const fileContent = await fs.promises.readFile(file, 'utf8');
                let isFormatted = false;
                
                if (this.useRealPrettier && this.prettier.format) {
                    try {
                        const options = await this.prettier.resolveConfig(file) || {};
                        const formatted = await this.prettier.format(fileContent, {
                            ...options,
                            filepath: file
                        });
                        isFormatted = fileContent === formatted;
                    } catch (formatError) {
                        console.error(`Error formatting ${file}:`, formatError);
                        isFormatted = false;
                    }
                } else if (this.prettier.check) {
                    // Use mock or fallback implementation
                    isFormatted = await this.prettier.check(fileContent, { filepath: file });
                } else {
                    console.error('Neither format nor check method available for Prettier');
                    isFormatted = false;
                }
                
                if (!isFormatted) {
                    unformattedFiles.push(file);
                }
            } catch (error) {
                console.error(`Error checking formatting for ${file}:`, error);
                unformattedFiles.push(file);
            }
        }
        
        return unformattedFiles;
    }

    private formatIssuesDetails(issues: ESLintIssue[]): string {
        return issues.map(issue => 
            `${issue.filePath}:${issue.line}:${issue.column} - ${issue.message} (${issue.ruleId})`
        ).join('\n');
    }

    private formatPrettierDetails(files: string[]): string {
        return files.map(file => 
            `${file} - File does not match Prettier formatting rules`
        ).join('\n');
    }
}