import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, PerformanceIssue } from '../types';

export class PythonAnalyzer extends BasePerformanceAnalyzer {
    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        const result = this.createBaseResult(fileContent, filePath);
        const lines = fileContent.split('\n');

        this.analyzePythonAntiPatterns(fileContent, lines, result);
        this.analyzeComprehensions(fileContent, lines, result);
        this.analyzeGeneratorUsage(fileContent, lines, result);
        
        const metrics = this.calculatePythonMetrics(fileContent);
        result.metrics = { ...result.metrics, ...metrics };
        
        return result;
    }

    private analyzePythonAntiPatterns(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for list concatenation in loops
        const listConcatRegex = /for\s+\w+\s+in\s+.+:\s*\n\s+\w+\s*\+=/g;
        let match;
        while ((match = listConcatRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient List Concatenation',
                description: 'Using += for list concatenation in loops is inefficient',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use list.extend() or list comprehension instead',
                solutionCode: '# Instead of:\nresult = []\nfor item in items:\n    result += [item]\n\n# Use:\nresult = [item for item in items]\n# Or:\nresult = list(items)'
            });
        }

        // Check for multiple string concatenation
        const stringConcatRegex = /(?:"\s*\+\s*"|'\s*\+\s*')/g;
        while ((match = stringConcatRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'String Concatenation',
                description: 'Multiple string concatenations can be inefficient',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use string formatting or f-strings',
                solutionCode: '# Instead of:\nname = "Hello, " + first_name + " " + last_name\n\n# Use:\nname = f"Hello, {first_name} {last_name}"'
            });
        }
    }

    private analyzeComprehensions(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for nested loops that could be list comprehensions
        const nestedLoopRegex = /for\s+\w+\s+in\s+.+:\s*\n\s+for\s+\w+\s+in\s+.+:\s*\n\s+\w+\.append/g;
        let match;
        while ((match = nestedLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Nested Loops',
                description: 'Nested loops could be replaced with list comprehension',
                severity: 'info',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 4),
                solution: 'Use list comprehension for better readability and performance',
                solutionCode: '# Instead of:\nresult = []\nfor x in xs:\n    for y in ys:\n        result.append(f(x, y))\n\n# Use:\nresult = [f(x, y) for x in xs for y in ys]'
            });
        }
    }

    private analyzeGeneratorUsage(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for opportunities to use generators
        const listCreationRegex = /list\s*\(\s*range\s*\(\s*\d+\s*\)\s*\)/g;
        let match;
        while ((match = listCreationRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Large Range List Creation',
                description: 'Creating large lists with range() can consume unnecessary memory',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use range directly as an iterator or generator expression',
                solutionCode: '# Instead of:\nfor i in list(range(1000000)):\n    process(i)\n\n# Use:\nfor i in range(1000000):\n    process(i)'
            });
        }
    }

    private calculatePythonMetrics(content: string): Record<string, number> {
        return {
            functionCount: (content.match(/def\s+\w+\s*\(/g) || []).length,
            classCount: (content.match(/class\s+\w+\s*(?:\([^)]*\))?\s*:/g) || []).length,
            decoratorCount: (content.match(/@\w+/g) || []).length,
            generatorCount: (content.match(/yield\s+/g) || []).length,
            comprehensionCount: (content.match(/\[.*for.*in.*\]/g) || []).length,
            importCount: (content.match(/^import\s+|\s*from\s+.*import/gm) || []).length
        };
    }
}