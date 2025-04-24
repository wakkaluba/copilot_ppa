import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult } from '../types';

export class CSharpAnalyzer extends BasePerformanceAnalyzer {
    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        const result = this.createBaseResult(fileContent, filePath);
        const lines = fileContent.split('\n');

        this.analyzeLINQOperations(fileContent, lines, result);
        this.analyzeStringOperations(fileContent, lines, result);
        this.analyzeDisposableUsage(fileContent, lines, result);
        this.analyzeAsyncAwait(fileContent, lines, result);
        this.analyzeLoopAllocations(fileContent, lines, result);
        
        const metrics = this.calculateCSharpMetrics(fileContent);
        result.metrics = { ...result.metrics, ...metrics };
        
        return result;
    }

    private analyzeLINQOperations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const inefficientLinqRegex = /\.Select\([^)]+\)\.Where\([^)]+\)/g;
        let match;
        while ((match = inefficientLinqRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient LINQ Operation Order',
                description: 'Filter operations (Where) should come before transformations (Select) for better performance',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Reorder LINQ operations to filter data before transforming it',
                solutionCode: '// Instead of:\nitems.Select(x => Transform(x)).Where(x => Filter(x))\n\n// Use:\nitems.Where(x => Filter(x)).Select(x => Transform(x))'
            });
        }
    }

    private analyzeStringOperations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const stringBuilderRegex = /for\s*\([^)]+\)\s*{[^}]*?\+=/gs;
        let match;
        while ((match = stringBuilderRegex.exec(fileContent)) !== null) {
            if (!match[0].includes('StringBuilder')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'String Concatenation in Loop',
                    description: 'String concatenation in loops creates unnecessary temporary objects',
                    severity: 'high',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use StringBuilder for string concatenation in loops',
                    solutionCode: '// Instead of:\nstring result = "";\nforeach (var item in items)\n{\n    result += item;\n}\n\n// Use:\nvar sb = new StringBuilder();\nforeach (var item in items)\n{\n    sb.Append(item);\n}\nstring result = sb.ToString();'
                });
            }
        }
    }

    private analyzeDisposableUsage(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const disposableRegex = /new\s+(SqlConnection|FileStream|StreamReader|StreamWriter)[^{;]*(?!using)/g;
        let match;
        while ((match = disposableRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Disposable Resource Not in Using Block',
                description: 'Disposable resources should be properly disposed of using a using block',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Wrap disposable objects in using statements',
                solutionCode: '// Instead of:\nvar conn = new SqlConnection(connectionString);\ntry {\n    // use connection\n} finally {\n    conn.Dispose();\n}\n\n// Use:\nusing (var conn = new SqlConnection(connectionString))\n{\n    // use connection\n}'
            });
        }
    }

    private analyzeAsyncAwait(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const syncOverAsyncRegex = /\.Result|\\.Wait\(\)/g;
        let match;
        while ((match = syncOverAsyncRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Blocking on Async Operation',
                description: 'Blocking on async operations can lead to thread pool starvation',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use async/await instead of blocking on async operations',
                solutionCode: '// Instead of:\nvar result = asyncOperation.Result;\n// or\nasyncOperation.Wait();\n\n// Use:\nvar result = await asyncOperation;'
            });
        }
    }

    private analyzeLoopAllocations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const newInLoopRegex = /(?:for|foreach)\s*\([^{]+\{\s*[^}]*?new\s+(?!Exception|StringBuilder|DateTime)\w+/g;
        let match;
        while ((match = newInLoopRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Object Allocation in Loop',
                description: 'Creating new objects inside loops can cause memory pressure',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider object pooling or moving object creation outside the loop',
                solutionCode: '// Instead of:\nfor (int i = 0; i < items.Length; i++)\n{\n    var obj = new MyObject(); // Creates many objects\n    // use obj\n}\n\n// Use:\nvar obj = new MyObject(); // Create once\nfor (int i = 0; i < items.Length; i++)\n{\n    obj.Reset(); // Reuse object\n    // use obj\n}'
            });
        }
    }

    private calculateCSharpMetrics(content: string): Record<string, number> {
        const lines = content.split('\n');
        return {
            classCount: (content.match(/\bclass\s+\w+/g) || []).length,
            methodCount: (content.match(/\b(public|private|protected)\s+[\w<>[\]]+\s+\w+\s*\(/g) || []).length,
            usingCount: (content.match(/^using\s+/gm) || []).length,
            commentRatio: Math.round(((content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length / lines.length) * 100),
            averageMethodLength: this.calculateAverageMethodLength(content),
            linqUsage: (content.match(/\.(Select|Where|OrderBy|GroupBy)\(/g) || []).length,
            asyncMethodCount: (content.match(/\basync\s+\w+/g) || []).length,
            disposableUsage: (content.match(/\busing\s*\(/g) || []).length,
            genericTypeCount: (content.match(/<[^>]+>/g) || []).length,
            stringBuilderUsage: (content.match(/StringBuilder/g) || []).length,
            taskUsage: (content.match(/Task<[^>]*>/g) || []).length,
            lockUsage: (content.match(/\block\s*\(/g) || []).length
        };
    }

    private calculateAverageMethodLength(content: string): number {
        const methodRegex = /\b(public|private|protected)\s+[\w<>[\]]+\s+\w+\s*\([^{]*\{/g;
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