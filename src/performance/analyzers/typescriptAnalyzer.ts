import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, PerformanceIssue, AnalyzerOptions } from '../types';

export class TypeScriptAnalyzer extends BasePerformanceAnalyzer {
    protected options: AnalyzerOptions;

    constructor(options?: AnalyzerOptions) {
        super(options);
        this.options = options || {};
    }

    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        const result = this.createBaseResult(fileContent, filePath);
        const lines = fileContent.split('\n');

        // Calculate TypeScript-specific metrics
        const methodLength = this.calculateAverageMethodLength(fileContent);
        const complexity = this.analyzeComplexity(fileContent, lines);
        const nesting = this.analyzeNesting(fileContent);

        // Add TypeScript-specific issues
        result.issues.push(...this.analyzeTypeScriptAntipatterns(fileContent, lines));
        result.issues.push(...this.analyzeResourceUsage(fileContent, lines));
        result.issues.push(...this.analyzeCommonAntiPatterns(fileContent, lines));

        result.metrics = {
            ...result.metrics,
            averageMethodLength: methodLength,
            cyclomaticComplexity: complexity,
            maxNestingDepth: nesting
        };

        return result;
    }

    protected calculateAverageMethodLength(content: string): number {
        const methodRegex = /(?:function\s+\w+|[\w.]+\s*=\s*function|\([^)]*\)\s*=>)\s*{[^}]*}/g;
        const methods = content.match(methodRegex) || [];
        
        if (methods.length === 0) return 0;

        const totalLines = methods.reduce((sum, method) => 
            sum + method.split('\n').length, 0);
        
        return Math.round(totalLines / methods.length);
    }

    private analyzeTypeScriptAntipatterns(fileContent: string, lines: string[]): PerformanceIssue[] {
        const issues: PerformanceIssue[] = [];

        // Check for any type usage
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

        // Check for type assertion abuse
        const typeAssertionRegex = /as\s+[A-Z]\w+/g;
        while ((match = typeAssertionRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Type Assertion Usage',
                description: 'Frequent type assertions may indicate design issues',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 2),
                solution: 'Use type guards or proper type definitions',
                solutionCode: '// Instead of:\nconst value = input as MyType;\n\n// Use:\nif (isMyType(input)) {\n    const value = input; // automatically typed\n}'
            });
        }

        // Check for non-null assertion operator
        const nonNullRegex = /!\./g;
        while ((match = nonNullRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            issues.push({
                title: 'Non-null Assertion Usage',
                description: 'Non-null assertions (!.) can lead to runtime errors',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 2),
                solution: 'Use proper null checking or optional chaining',
                solutionCode: '// Instead of:\nconst value = obj!.prop;\n\n// Use:\nconst value = obj?.prop ?? defaultValue;'
            });
        }

        return issues;
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
        if (!methods) return 0;

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