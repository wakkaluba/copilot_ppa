import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, PerformanceIssue } from '../types';

export class JavaAnalyzer extends BasePerformanceAnalyzer {
    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        const result = this.createBaseResult(fileContent, filePath);
        const lines = fileContent.split('\n');

        this.analyzeStringOperations(fileContent, lines, result);
        this.analyzeCollectionUsage(fileContent, lines, result);
        this.analyzeExceptionHandling(fileContent, lines, result);
        this.analyzeStreamOperations(fileContent, lines, result);
        this.analyzeStaticFields(fileContent, lines, result);
        
        const metrics = this.calculateJavaMetrics(fileContent);
        result.metrics = { ...result.metrics, ...metrics };
        
        return result;
    }

    private analyzeStringOperations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check string concatenation in loops
        const stringConcatRegex = /for\s*\([^)]+\)\s*\{[^}]*?\+=/gs;
        let match;
        while ((match = stringConcatRegex.exec(fileContent)) !== null) {
            if (!match[0].includes('StringBuilder')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'Inefficient String Concatenation',
                    description: 'String concatenation in loops creates many temporary objects',
                    severity: 'medium',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Use StringBuilder instead of String concatenation',
                    solutionCode: '// Instead of:\nString result = "";\nfor (String item : items) {\n    result += item;\n}\n\n// Use:\nStringBuilder sb = new StringBuilder();\nfor (String item : items) {\n    sb.append(item);\n}\nString result = sb.toString();'
                });
            }
        }
    }

    private analyzeCollectionUsage(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for inefficient collection iteration
        const inefficientIterationRegex = /for\s*\(\s*int\s+\w+\s*=\s*0\s*;\s*\w+\s*<\s*(\w+)\.size\(\)\s*;/g;
        let match;
        while ((match = inefficientIterationRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient Collection Iteration',
                description: 'Calling .size() in every loop iteration is inefficient',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Cache the collection size before the loop',
                solutionCode: '// Instead of:\nfor (int i = 0; i < list.size(); i++) {\n    // loop body\n}\n\n// Use:\nint size = list.size();\nfor (int i = 0; i < size; i++) {\n    // loop body\n}'
            });
        }

        // Check synchronized collection usage
        const syncCollectionRegex = /Collections\.synchronized(Map|List|Set)/g;
        while ((match = syncCollectionRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Synchronized Collection Usage',
                description: 'Synchronized collections can be a performance bottleneck',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using concurrent collections from java.util.concurrent',
                solutionCode: '// Instead of:\nMap<K,V> map = Collections.synchronizedMap(new HashMap<>());\n\n// Use:\nMap<K,V> map = new ConcurrentHashMap<>();'
            });
        }
    }

    private analyzeExceptionHandling(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const catchBlockRegex = /catch\s*\(\s*(Exception|Throwable)\s+\w+\s*\)\s*\{/g;
        let match;
        while ((match = catchBlockRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Generic Exception Handling',
                description: 'Catching generic exceptions can mask errors and impact performance',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Catch specific exceptions instead of using generic Exception or Throwable',
                solutionCode: '// Instead of:\ntry {\n    // risky operation\n} catch (Exception e) {\n    // handle error\n}\n\n// Use:\ntry {\n    // risky operation\n} catch (IOException e) {\n    // handle IO error\n} catch (SQLException e) {\n    // handle SQL error\n}'
            });
        }
    }

    private analyzeStreamOperations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const streamOpsRegex = /\.stream\(\).*?\.collect\(/gs;
        let match;
        while ((match = streamOpsRegex.exec(fileContent)) !== null) {
            if (match[0].includes('.forEach(') || match[0].includes('.parallel()')) {
                const lineIndex = this.findLineNumber(fileContent, match.index);
                result.issues.push({
                    title: 'Potentially Inefficient Stream Operation',
                    description: 'Complex stream operations might be less performant than traditional loops',
                    severity: 'medium',
                    line: lineIndex + 1,
                    code: this.extractCodeSnippet(lines, lineIndex, 3),
                    solution: 'Consider using traditional loops for simple operations',
                    solutionCode: '// Instead of:\nlist.stream().forEach(item -> process(item));\n\n// Use:\nfor (Item item : list) {\n    process(item);\n}'
                });
            }
        }
    }

    private analyzeStaticFields(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const nonFinalStaticRegex = /static\s+(?!final\s+)\w+\s+\w+/g;
        let match;
        while ((match = nonFinalStaticRegex.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Non-final Static Field',
                description: 'Non-final static fields can cause thread safety issues',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider making the field final if it does not need to be modified',
                solutionCode: '// Instead of:\nstatic int counter;\n\n// Use:\nstatic final int COUNTER;'
            });
        }
    }

    private calculateJavaMetrics(content: string): Record<string, number> {
        const lines = content.split('\n');
        return {
            classCount: (content.match(/\bclass\s+\w+/g) || []).length,
            methodCount: (content.match(/\b(public|private|protected)\s+\w+\s+\w+\s*\(/g) || []).length,
            importCount: (content.match(/^import\s+/gm) || []).length,
            commentRatio: Math.round(((content.match(/\/\*[\s\S]*?\*\/|\/\/.*/g) || []).length / lines.length) * 100),
            averageMethodLength: this.calculateAverageMethodLength(content),
            streamApiUsage: (content.match(/\.stream\(\)/g) || []).length,
            finalFieldCount: (content.match(/final\s+\w+/g) || []).length,
            genericTypeCount: (content.match(/<[^>]+>/g) || []).length,
            parallelStreamCount: (content.match(/\.parallelStream\(\)/g) || []).length,
            stringBuilderUsage: (content.match(/StringBuilder|StringBuffer/g) || []).length,
            synchronizedBlockCount: (content.match(/synchronized\s*\([^)]*\)/g) || []).length,
            concurrentUtilsCount: (content.match(/java\.util\.concurrent/g) || []).length
        };
    }

    private calculateAverageMethodLength(content: string): number {
        const methodRegex = /\b(public|private|protected)\s+[\w<>]+\s+\w+\s*\([^{]*\{/g;
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