import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, LanguageMetricThresholds } from '../types';

export class JavaAnalyzer extends BasePerformanceAnalyzer {
    protected override thresholds: LanguageMetricThresholds = {
        cyclomaticComplexity: [10, 20],
        nestedBlockDepth: [3, 5],
        functionLength: [100, 200],
        parameterCount: [4, 7],
        maintainabilityIndex: [65, 85],
        commentRatio: [10, 20]
    };

    private readonly memoryPatterns = {
        stringBufferInit: /new\s+String(?:Buffer|Builder)\s*\(\s*\d+\s*\)/g,
        staticCollections: /static\s+(?:final\s+)?(?:List|Set|Map)</g,
        resourceLeaks: /new\s+(?:File|Socket|Connection)[^;]+;(?![^}]*(?:close|dispose)\s*\(\s*\))/g,
        unclosedResources: /try\s*\{[^}]*new\s+(?:File|Socket|Connection)[^;]+;[^}]*\}\s*catch/g,
        nonFinalStatics: /static\s+(?!final\s+)\w+\s+\w+/g
    };

    private readonly concurrencyPatterns = {
        unsynchronizedStatic: /static\s+(?!final\s+)(?!synchronized\s+)\w+\s+\w+/g,
        synchronizedMethod: /synchronized\s+\w+\s+\w+\s*\([^)]*\)/g,
        lockUsage: /(?:ReentrantLock|Lock)\s+\w+\s*=/g,
        threadCreation: /new\s+Thread\s*\(/g,
        executorUsage: /Executors\.\w+/g
    };

    private readonly performancePatterns = {
        stringConcat: /(?:"\s*\+\s*"|'\s*\+\s*')/g,
        boxingInLoop: /for[^{]+\{[^}]*(?:Integer|Long|Double|Boolean)\.(?:valueOf|parse)/g,
        collectionSizeInLoop: /for[^{]+\{[^}]*\.\s*size\s*\(\s*\)/g,
        inefficientListAccess: /for\s*\([^)]+\)\s*\{[^}]*\.get\s*\(\s*i\s*\)/g,
        repeatedMethodCalls: /(\w+\.\w+\([^)]*\).*){3,}/g
    };

    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        const result = this.createBaseResult(fileContent, filePath);
        const lines = fileContent.split('\n');

        try {
            // Core analysis steps
            this.analyzeMemoryPatterns(fileContent, lines, result);
            this.analyzeConcurrencyPatterns(fileContent, lines, result);
            this.analyzePerformancePatterns(fileContent, lines, result);
            this.analyzeCollectionUsage(fileContent, lines, result);
            this.analyzeStreamOperations(fileContent, lines, result);
            this.analyzeExceptionHandling(fileContent, lines, result);
            this.analyzeJavaSpecifics(fileContent, lines, result);

            // Calculate and merge metrics
            const metrics = this.calculateJavaMetrics(fileContent);
            result.metrics = { ...result.metrics, ...metrics };

            return result;
        } catch (error) {
            console.error(`Error analyzing Java file ${filePath}:`, error);
            result.issues.push({
                title: 'Analysis Error',
                description: 'Failed to complete full analysis of file',
                severity: 'low',
                line: 0,
                code: null,
                solution: 'Review file for potential syntax errors or unsupported constructs'
            });
            return result;
        }
    }

    private analyzeMemoryPatterns(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check non-final static fields
        let match;
        while ((match = this.memoryPatterns.nonFinalStatics.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Non-final Static Field',
                description: 'Non-final static fields can cause memory leaks and thread safety issues',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Make static fields final or convert to instance fields',
                solutionCode: '// Instead of:\nstatic List<String> data;\n\n// Use:\nprivate static final List<String> DATA = new ArrayList<>();\n// Or:\nprivate List<String> data;'
            });
        }

        // Check resource leaks
        while ((match = this.memoryPatterns.resourceLeaks.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Potential Resource Leak',
                description: 'Resource not properly closed in a finally block or try-with-resources',
                severity: 'critical',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use try-with-resources statement',
                solutionCode: '// Instead of:\nFileInputStream fis = new FileInputStream(file);\ntry {\n    // use fis\n} finally {\n    fis.close();\n}\n\n// Use:\ntry (FileInputStream fis = new FileInputStream(file)) {\n    // use fis\n}'
            });
        }
    }

    private analyzeConcurrencyPatterns(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check synchronized method usage
        let match;
        while ((match = this.concurrencyPatterns.synchronizedMethod.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Coarse-grained Synchronization',
                description: 'Method-level synchronization might be too coarse-grained',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using more fine-grained synchronization or concurrent collections',
                solutionCode: '// Instead of:\nsynchronized void processData(Data data) {\n    // process\n}\n\n// Use:\nvoid processData(Data data) {\n    synchronized(lock) {\n        // critical section\n    }\n    // non-critical section\n}'
            });
        }

        // Check thread creation
        while ((match = this.concurrencyPatterns.threadCreation.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Direct Thread Creation',
                description: 'Creating threads directly instead of using ExecutorService',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use ExecutorService for better thread management',
                solutionCode: '// Instead of:\nnew Thread(() -> process()).start();\n\n// Use:\nExecutorService executor = Executors.newFixedThreadPool(nThreads);\nexecutor.submit(() -> process());'
            });
        }
    }

    private analyzePerformancePatterns(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check boxing in loops
        let match;
        while ((match = this.performancePatterns.boxingInLoop.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Autoboxing in Loop',
                description: 'Autoboxing/unboxing in loops can impact performance',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use primitive types in performance-critical loops',
                solutionCode: '// Instead of:\nfor (int i = 0; i < n; i++) {\n    Integer value = Integer.valueOf(i); // boxing\n}\n\n// Use:\nfor (int i = 0; i < n; i++) {\n    int value = i; // no boxing\n}'
            });
        }

        // Check collection size in loop
        while ((match = this.performancePatterns.collectionSizeInLoop.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient Loop Condition',
                description: 'Calling size() in every loop iteration',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Cache the collection size before the loop',
                solutionCode: '// Instead of:\nfor (int i = 0; i < list.size(); i++)\n\n// Use:\nint size = list.size();\nfor (int i = 0; i < size; i++)'
            });
        }
    }

    private analyzeCollectionUsage(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const syncCollections = (fileContent.match(/Collections\.synchronized\w+\(/g) || []).length;
        if (syncCollections > 0) {
            result.issues.push({
                title: 'Legacy Synchronized Collections',
                description: 'Using legacy synchronized collections instead of concurrent collections',
                severity: 'medium',
                line: this.findFirstOccurrence(lines, 'Collections.synchronized'),
                code: 'Collections.synchronizedMap(new HashMap<>())',
                solution: 'Consider using concurrent collections from java.util.concurrent',
                solutionCode: 'Map<K,V> map = new ConcurrentHashMap<>();'
            });
        }
    }

    private analyzeStreamOperations(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        const parallelStreams = (fileContent.match(/\.parallelStream\(\)/g) || []).length;
        if (parallelStreams > 0) {
            this.analyzeParallelStreamUsage(fileContent, lines, result, parallelStreams);
        }

        const streamCollectors = (fileContent.match(/\.collect\(Collectors\./g) || []).length;
        if (streamCollectors > 10) {
            result.issues.push({
                title: 'Heavy Stream Processing',
                description: 'Multiple stream collectors in use. Consider performance impact.',
                severity: 'medium',
                line: this.findFirstOccurrence(lines, '.collect(Collectors.'),
                code: '.collect(Collectors...)',
                solution: 'Consider using for loops for simple operations or batch processing for large datasets'
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

    private analyzeJavaSpecifics(fileContent: string, _lines: string[], result: PerformanceAnalysisResult): void {
        // Check for modern Java features usage
        const modernFeatures = {
            optionalUsage: /Optional\.</g,
            streamApi: /\.stream\(\)/g,
            varKeyword: /\bvar\b/g
        };

        for (const [feature, pattern] of Object.entries(modernFeatures)) {
            if (!pattern.test(fileContent)) {
                result.issues.push({
                    title: 'Modern Java Feature Opportunity',
                    description: `Consider using ${feature} for better code quality`,
                    severity: 'info',
                    line: 1,
                    code: null,
                    solution: 'Utilize modern Java features where appropriate',
                    solutionCode: feature === 'Optional' ?
                        '// Use Optional to handle nullable values:\nOptional.ofNullable(value).orElse(defaultValue)' :
                        feature === 'streamApi' ?
                        '// Use Stream API for collections:\nlist.stream().filter(predicate).map(mapper).collect(Collectors.toList())' :
                        '// Use var for local variables:\nvar result = new HashMap<String, List<Integer>>();'
                });
            }
        }
    }

    private calculateJavaMetrics(content: string): Record<string, number> {
        return {
            classCount: (content.match(/\bclass\s+\w+/g) || []).length,
            methodCount: (content.match(/(?:public|private|protected)\s+\w+\s+\w+\s*\(/g) || []).length,
            fieldCount: (content.match(/(?:public|private|protected)\s+\w+\s+\w+\s*;/g) || []).length,
            interfaceCount: (content.match(/\binterface\s+\w+/g) || []).length,
            enumCount: (content.match(/\benum\s+\w+/g) || []).length,
            annotationCount: (content.match(/\bannotation\s+\w+/g) || []).length,
            genericsUsageCount: (content.match(/[A-Z]<[^>]+>/g) || []).length,
            lambdaCount: (content.match(/\->|::/g) || []).length,
            streamApiUsageCount: (content.match(/\.stream\(\)/g) || []).length,
            synchronizedBlockCount: (content.match(/\bsynchronized\b/g) || []).length
        };
    }

    private findFirstOccurrence(lines: string[], searchString: string, pattern?: RegExp): number {
        for (let i = 0; i < lines.length; i++) {
            if (pattern) {
                if (pattern.test(lines[i] || '')) {
                    return i + 1;
                }
            } else {
                if ((lines[i] || '').includes(searchString)) {
                    return i + 1;
                }
            }
        }
        return 1;
    }

    private analyzeParallelStreamUsage(fileContent: string, lines: string[], result: PerformanceAnalysisResult, parallelStreamCount: number): void {
        const hasCollectors = fileContent.includes('.collect(');
        if (parallelStreamCount > 0 && !hasCollectors) {
            result.issues.push({
                title: 'Inefficient Parallel Stream Usage',
                description: 'Parallel streams without collectors may not provide performance benefits',
                severity: 'medium',
                line: this.findFirstOccurrence(lines, '.parallelStream()'),
                code: '.parallelStream()',
                solution: 'Consider using parallel streams only for computationally intensive operations with collectors'
            });
        }
    }
}