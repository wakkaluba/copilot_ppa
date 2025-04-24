import { inject, injectable } from 'inversify';
import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, AnalyzerOptions } from '../types';
import { ILogger } from '../../logging/ILogger';
import { TypeScriptPatternAnalyzer } from './services/TypeScriptPatternAnalyzer';
import { TypeScriptMetricsCalculator } from './services/TypeScriptMetricsCalculator';

@injectable()
export class TypeScriptAnalyzer extends BasePerformanceAnalyzer {
    constructor(
        @inject(ILogger) private readonly logger: ILogger,
        @inject(TypeScriptPatternAnalyzer) private readonly patternAnalyzer: TypeScriptPatternAnalyzer,
        @inject(TypeScriptMetricsCalculator) private readonly metricsCalculator: TypeScriptMetricsCalculator,
        options?: AnalyzerOptions
    ) {
        super(options);
    }

    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        try {
            const result = this.createBaseResult(fileContent, filePath);
            const lines = fileContent.split('\n');

            // Analyze patterns and add issues
            result.issues.push(
                ...this.patternAnalyzer.analyzeTypeScriptPatterns(fileContent, lines),
                ...this.analyzeArrayOperations(fileContent, lines),
                ...this.analyzeAsyncPatterns(fileContent, lines),
                ...this.analyzeMemoryUsage(fileContent, lines),
                ...this.analyzeDOMOperations(fileContent, lines),
                ...this.analyzeEventHandlers(fileContent, lines),
                ...this.analyzeCommonAntiPatterns(fileContent, lines)
            );

            // Calculate and merge metrics
            result.metrics = {
                ...result.metrics,
                ...this.metricsCalculator.calculateMetrics(fileContent)
            };

            return result;
        } catch (error) {
            this.logger.error('Error analyzing TypeScript file:', error);
            return this.createErrorResult(fileContent, filePath, error);
        }
    }

    private analyzeArrayOperations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for array concatenation in loops
        const arrayOpRegex = /for\s*\([^)]+\)\s*\{[^}]*?\.concat\(/gs;
        let match;
        while ((match = arrayOpRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient Array Operation',
                description: 'Array concatenation in loops creates unnecessary temporary arrays',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use array push or spread operator instead of concat',
                solutionCode: '// Instead of:\nlet result = [];\nfor (const item of items) {\n    result = result.concat(process(item));\n}\n\n// Use:\nconst result = [];\nfor (const item of items) {\n    result.push(...process(item));\n}'
            });
        }

        // Check for indexOf in loops
        const indexOfInLoopRegex = /for\s*\([^)]+\)\s*\{[^}]*?\.indexOf\([^)]+\)/gs;
        while ((match = indexOfInLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient Array Search',
                description: 'Using indexOf in loops can lead to O(n²) complexity',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use Set or Map for O(1) lookups',
                solutionCode: '// Instead of:\nconst items = [...];\nfor (const item of data) {\n    if (items.indexOf(item) !== -1) { ... }\n}\n\n// Use:\nconst itemSet = new Set(items);\nfor (const item of data) {\n    if (itemSet.has(item)) { ... }\n}'
            });
        }
    }

    private analyzeAsyncPatterns(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for Promise.all usage with large arrays
        const promiseAllRegex = /Promise\.all\(\s*(\w+)\.map/g;
        let match;
        while ((match = promiseAllRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Unbounded Parallel Promises',
                description: 'Using Promise.all with map can start too many concurrent operations',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use Promise pool or limit concurrent operations',
                solutionCode: '// Instead of:\nawait Promise.all(items.map(item => process(item)));\n\n// Use:\nconst pool = new PromisePool(items, item => process(item), { concurrency: 5 });\nawait pool.start();'
            });
        }
    }

    private analyzeMemoryUsage(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for closure memory leaks
        const closureLeakRegex = /setInterval\(\s*function\s*\([^)]*\)\s*\{[^}]*?this\./g;
        let match;
        while ((match = closureLeakRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Potential Memory Leak',
                description: 'Closure referencing this in setInterval can cause memory leaks',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Store references locally or use arrow functions',
                solutionCode: '// Instead of:\nsetInterval(function() {\n    this.update();\n}, 1000);\n\n// Use:\nconst self = this;\nsetInterval(() => self.update(), 1000);'
            });
        }
    }

    private analyzeDOMOperations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for frequent DOM updates
        const domUpdateRegex = /for\s*\([^)]+\)\s*\{[^}]*?(innerHTML|appendChild|removeChild)/g;
        let match;
        while ((match = domUpdateRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Frequent DOM Updates',
                description: 'Multiple DOM updates in a loop can cause layout thrashing',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Batch DOM updates or use DocumentFragment',
                solutionCode: '// Instead of:\nfor (const item of items) {\n    container.appendChild(createNode(item));\n}\n\n// Use:\nconst fragment = document.createDocumentFragment();\nfor (const item of items) {\n    fragment.appendChild(createNode(item));\n}\ncontainer.appendChild(fragment);'
            });
        }
    }

    private analyzeEventHandlers(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for unbounded event listeners
        const eventListenerRegex = /addEventListener\([^)]+\)/g;
        const removeListenerRegex = /removeEventListener\([^)]+\)/g;
        const addCount = (fileContent.match(eventListenerRegex) || []).length;
        const removeCount = (fileContent.match(removeListenerRegex) || []).length;

        if (addCount > removeCount) {
            result.issues.push({
                title: 'Potential Event Listener Leak',
                description: 'More event listeners are added than removed',
                severity: 'medium',
                line: 1,
                code: this.extractCodeSnippet(lines, 0, 3),
                solution: 'Ensure all event listeners are properly removed',
                solutionCode: '// Instead of:\nelement.addEventListener("click", handler);\n// ... never removed\n\n// Use:\nconst handler = (e) => { ... };\nelement.addEventListener("click", handler);\n// Later when done:\nelement.removeEventListener("click", handler);'
            });
        }
    }

    private calculateTypeScriptMetrics(content: string): Record<string, number> {
        const lines = content.split('\n');
        return {
            classCount: (content.match(/\bclass\s+\w+/g) || []).length,
            methodCount: (content.match(/\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g) || []).length,
            importCount: (content.match(/^import\s+/gm) || []).length,
            commentRatio: Math.round(((content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length / lines.length) * 100),
            averageMethodLength: this.calculateAverageMethodLength(content),
            asyncMethodCount: (content.match(/\basync\s+/g) || []).length,
            promiseUsage: (content.match(/Promise\./g) || []).length,
            arrowFunctionCount: (content.match(/=>/g) || []).length,
            typeAnnotationCount: (content.match(/:\s*[A-Z]\w+/g) || []).length,
            eventListenerCount: (content.match(/addEventListener\(/g) || []).length,
            domManipulationCount: (content.match(/document\.|getElementById|querySelector/g) || []).length
        };
    }

    private calculateAverageMethodLength(content: string): number {
        const methodRegex = /\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g;
        const methods = content.match(methodRegex);
        if (!methods) {return 0;}

        let totalLines = 0;
        let methodCount = 0;
        const lines = content.split('\n');
        
        methods.forEach(method => {
            const startIndex = content.indexOf(method);
            const lineIndex = this.findLineNumber(content, startIndex);
            let bracketCount = 1;
            let currentLine = lineIndex;
            
            while (bracketCount > 0 && currentLine < lines.length) {
                const line = lines[currentLine];
                bracketCount += (line.match(/{/g) || []).length;
                bracketCount -= (line.match(/}/g) || []).length;
                currentLine++;
            }
            
            totalLines += currentLine - lineIndex;
            methodCount++;
        });
        
        return Math.round(totalLines / methodCount);
    }
}