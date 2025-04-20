import { PerformanceAnalysisResult, PerformanceIssue, AnalyzerOptions, LanguageMetricThresholds } from '../types';
import * as path from 'path';

export abstract class BasePerformanceAnalyzer {
    protected thresholds: LanguageMetricThresholds;
    protected options: AnalyzerOptions;

    constructor(options?: AnalyzerOptions) {
        this.options = options || {
            maxFileSize: 1024 * 1024,
            excludePatterns: ['**/node_modules/**'],
            includeTests: false,
            thresholds: {
                cyclomaticComplexity: [10, 20],
                nestedBlockDepth: [3, 5],
                functionLength: [50, 100],
                parameterCount: [4, 7],
                maintainabilityIndex: [65, 85],
                commentRatio: [10, 20]
            }
        };
        this.thresholds = this.options.thresholds;
    }

    public abstract analyze(fileContent: string, filePath: string): PerformanceAnalysisResult;

    protected createBaseResult(fileContent: string, filePath: string): PerformanceAnalysisResult {
        return {
            filePath,
            fileSize: Buffer.from(fileContent).length,
            issues: [],
            metrics: this.calculateBaseMetrics(fileContent)
        };
    }

    protected calculateBaseMetrics(content: string): Record<string, number> {
        const lines = content.split('\n');
        const nonEmptyLines = lines.filter(line => line.trim().length > 0);
        const commentLines = lines.filter(line => line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*'));
        
        return {
            totalLines: lines.length,
            nonEmptyLines: nonEmptyLines.length,
            commentLines: commentLines.length,
            commentRatio: (commentLines.length / nonEmptyLines.length) * 100 || 0
        };
    }

    protected extractCodeSnippet(lines: string[], lineIndex: number, contextLines: number = 3): string {
        const start = Math.max(0, lineIndex - contextLines);
        const end = Math.min(lines.length, lineIndex + contextLines + 1);
        return lines.slice(start, end).join('\n');
    }

    protected findLineNumber(content: string, index: number): number {
        return content.substring(0, index).split('\n').length - 1;
    }

    protected shouldAnalyzeFile(filePath: string): boolean {
        if (!this.options.includeTests && this.isTestFile(filePath)) {
            return false;
        }

        for (const pattern of this.options.excludePatterns) {
            if (this.matchesGlobPattern(filePath, pattern)) {
                return false;
            }
        }

        return true;
    }

    private isTestFile(filePath: string): boolean {
        const fileName = path.basename(filePath).toLowerCase();
        return fileName.includes('.test.') || 
               fileName.includes('.spec.') || 
               fileName.startsWith('test_') ||
               fileName.endsWith('_test.py');
    }

    private matchesGlobPattern(filePath: string, pattern: string): boolean {
        const regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp(`^${regexPattern}$`).test(filePath);
    }

    protected calculateContentHash(content: string): string {
        let hash = 0;
        for (let i = 0; i < content.length; i++) {
            const char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    }

    protected estimateMaxNestedDepth(content: string): number {
        const lines = content.split('\n');
        let maxDepth = 0;
        let currentDepth = 0;

        for (const line of lines) {
            const openBrackets = (line.match(/{/g) || []).length;
            const closeBrackets = (line.match(/}/g) || []).length;
            currentDepth += openBrackets - closeBrackets;
            maxDepth = Math.max(maxDepth, currentDepth);
        }

        return maxDepth;
    }

    protected analyzeComplexity(fileContent: string, lines: string[]): number {
        let complexity = 0;
        const controlFlowKeywords = [
            /\bif\b/, /\belse\b/, /\bfor\b/, /\bwhile\b/, /\bdo\b/,
            /\bswitch\b/, /\bcase\b/, /\bcatch\b/, /\b\?\b/, /\?\./,
            /\?\?/, /\|\|/, /&&/
        ];

        lines.forEach(line => {
            controlFlowKeywords.forEach(keyword => {
                if (keyword.test(line)) {
                    complexity++;
                }
            });
        });

        return complexity;
    }

    protected analyzeNesting(fileContent: string): number {
        let maxNesting = 0;
        let currentNesting = 0;
        const lines = fileContent.split('\n');

        lines.forEach(line => {
            const openBraces = (line.match(/{/g) || []).length;
            const closeBraces = (line.match(/}/g) || []).length;
            
            currentNesting += openBraces - closeBraces;
            maxNesting = Math.max(maxNesting, currentNesting);
        });

        return maxNesting;
    }

    protected analyzeResourceUsage(fileContent: string, lines: string[]): PerformanceIssue[] {
        const issues: PerformanceIssue[] = [];

        // Check for large object literals
        const largeObjectRegex = /{[^}]{1000,}}/g;
        let match;
        while ((match = largeObjectRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Large Object Literal',
                description: 'Large object literals can impact memory and initialization time',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider breaking down large objects or loading data dynamically',
                solutionCode: '// Instead of:\nconst data = {\n  // ... hundreds of properties\n};\n\n// Use:\nconst data = {};\nawait loadDataDynamically(data);'
            });
        }

        // Check for memory-intensive operations in loops
        const memoryIntensiveLoops = /for\s*\([^)]+\)\s*\{[^}]*?(new Array|new Object|JSON\.parse|JSON\.stringify)/g;
        while ((match = memoryIntensiveLoops.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Memory-Intensive Loop Operation',
                description: 'Creating objects or parsing JSON in loops can cause memory churn',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Move object creation outside loops or use object pooling',
                solutionCode: '// Instead of:\nfor (const item of items) {\n    const obj = new ExpensiveObject();\n    // use obj\n}\n\n// Use:\nconst obj = new ExpensiveObject();\nfor (const item of items) {\n    obj.reset();\n    // use obj\n}'
            });
        }

        return issues;
    }

    protected analyzeCommonAntiPatterns(fileContent: string, lines: string[]): PerformanceIssue[] {
        const issues: PerformanceIssue[] = [];

        // Check for nested loops
        const nestedLoopRegex = /for\s*\([^{]+\{[^}]*for\s*\([^{]+\{/g;
        let match;
        while ((match = nestedLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Nested Loops',
                description: 'Nested loops can lead to O(n²) complexity',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using Map/Set for lookups or restructuring the data',
                solutionCode: '// Instead of:\nfor (const item of items) {\n    for (const other of others) {\n        if (item.id === other.id) { ... }\n    }\n}\n\n// Use:\nconst itemMap = new Map(items.map(item => [item.id, item]));\nfor (const other of others) {\n    const item = itemMap.get(other.id);\n    if (item) { ... }\n}'
            });
        }

        // Check for recursive functions without base case
        const recursiveRegex = /function\s+(\w+)[^{]*\{[^}]*\1\s*\(/g;
        while ((match = recursiveRegex.exec(fileContent)) !== null) {
            if (!fileContent.includes('return') || !fileContent.includes('if')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                issues.push({
                    title: 'Unsafe Recursion',
                    description: 'Recursive function may lack proper base case',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Add proper base case and consider maximum recursion depth',
                    solutionCode: '// Instead of:\nfunction recurse(data) {\n    return recurse(process(data));\n}\n\n// Use:\nfunction recurse(data, depth = 0) {\n    if (depth > MAX_DEPTH || isBaseCase(data)) {\n        return data;\n    }\n    return recurse(process(data), depth + 1);\n}'
                });
            }
        }

        return issues;
    }
}