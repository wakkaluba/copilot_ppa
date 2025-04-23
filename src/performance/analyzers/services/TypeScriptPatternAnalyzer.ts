import { injectable } from 'inversify';
import { ILogger } from '../../../logging/ILogger';
import { PerformanceAnalysisResult, PerformanceIssue } from '../../types';

@injectable()
export class TypeScriptPatternAnalyzer {
    constructor(@inject(ILogger) private readonly logger: ILogger) {}

    public analyzeTypeScriptPatterns(fileContent: string, lines: string[]): PerformanceIssue[] {
        const issues: PerformanceIssue[] = [];

        try {
            this.checkAnyTypeUsage(fileContent, lines, issues);
            this.checkTypeAssertions(fileContent, lines, issues);
            this.checkNonNullAssertions(fileContent, lines, issues);
        } catch (error) {
            this.logger.error('Error analyzing TypeScript patterns:', error);
        }

        return issues;
    }

    private checkAnyTypeUsage(fileContent: string, lines: string[], issues: PerformanceIssue[]): void {
        const anyTypeRegex = /: any(?!\[\])/g;
        let match;
        while ((match = anyTypeRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Unspecified Type Usage',
                description: 'Using "any" type bypasses TypeScript type checking',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 2),
                solution: 'Define proper interface or type',
                solutionCode: '// Instead of:\nfunction process(data: any) {}\n\n// Use:\ninterface Data {\n    id: string;\n    value: number;\n}\nfunction process(data: Data) {}'
            });
        }
    }

    // ... rest of pattern checking methods ...

    private findLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length - 1;
    }

    private extractCodeSnippet(lines: string[], lineIndex: number, context: number = 2): string {
        const start = Math.max(0, lineIndex - context);
        const end = Math.min(lines.length, lineIndex + context + 1);
        return lines.slice(start, end).join('\n');
    }
}
