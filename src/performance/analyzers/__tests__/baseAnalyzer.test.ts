import { AnalyzerOptions, PerformanceAnalysisResult, PerformanceIssue } from '../../types';
import { BasePerformanceAnalyzer } from '../baseAnalyzer';

// Concrete implementation of the abstract class for testing
class TestAnalyzer extends BasePerformanceAnalyzer {
    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        const result = this.createBaseResult(fileContent, filePath);
        const lines = fileContent.split('\n');

        // Analyze complexity
        result.metrics.complexity = this.analyzeComplexity(fileContent, lines);

        // Analyze nesting
        result.metrics.maxNesting = this.analyzeNesting(fileContent);

        // Add issues from anti-patterns
        result.issues = [
            ...this.analyzeCommonAntiPatterns(fileContent, lines),
            ...this.analyzeResourceUsage(fileContent, lines)
        ];

        return result;
    }

    // Expose protected methods for testing
    public testCalculateBaseMetrics(content: string): Record<string, number> {
        return this.calculateBaseMetrics(content);
    }

    public testExtractCodeSnippet(lines: string[], lineIndex: number, contextLines: number = 3): string {
        return this.extractCodeSnippet(lines, lineIndex, contextLines);
    }

    public testFindLineNumber(content: string, index: number): number {
        return this.findLineNumber(content, index);
    }

    public testShouldAnalyzeFile(filePath: string): boolean {
        return this.shouldAnalyzeFile(filePath);
    }

    public testCalculateContentHash(content: string): string {
        return this.calculateContentHash(content);
    }

    public testEstimateMaxNestedDepth(content: string): number {
        return this.estimateMaxNestedDepth(content);
    }

    public testAnalyzeComplexity(fileContent: string, lines: string[]): number {
        return this.analyzeComplexity(fileContent, lines);
    }

    public testAnalyzeNesting(fileContent: string): number {
        return this.analyzeNesting(fileContent);
    }

    public testAnalyzeResourceUsage(fileContent: string, lines: string[]): PerformanceIssue[] {
        return this.analyzeResourceUsage(fileContent, lines);
    }

    public testAnalyzeCommonAntiPatterns(fileContent: string, lines: string[]): PerformanceIssue[] {
        return this.analyzeCommonAntiPatterns(fileContent, lines);
    }
}

describe('BasePerformanceAnalyzer', () => {
    let analyzer: TestAnalyzer;
    let defaultOptions: AnalyzerOptions;

    beforeEach(() => {
        defaultOptions = {
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
        analyzer = new TestAnalyzer(defaultOptions);
    });

    describe('constructor', () => {
        it('should use provided options when initialized', () => {
            const customOptions: AnalyzerOptions = {
                maxFileSize: 2 * 1024 * 1024,
                excludePatterns: ['**/node_modules/**', '**/dist/**'],
                includeTests: true,
                thresholds: {
                    cyclomaticComplexity: [15, 25],
                    nestedBlockDepth: [4, 6],
                    functionLength: [60, 120],
                    parameterCount: [5, 8],
                    maintainabilityIndex: [60, 80],
                    commentRatio: [15, 25]
                }
            };

            const customAnalyzer = new TestAnalyzer(customOptions);

            // Accessing protected property for testing
            expect((customAnalyzer as any).options).toEqual(customOptions);
            expect((customAnalyzer as any).thresholds).toEqual(customOptions.thresholds);
        });

        it('should use default options when none are provided', () => {
            const defaultAnalyzer = new TestAnalyzer();

            // Verify default values match expected defaults
            expect((defaultAnalyzer as any).options.maxFileSize).toBe(1024 * 1024);
            expect((defaultAnalyzer as any).options.excludePatterns).toContain('**/node_modules/**');
            expect((defaultAnalyzer as any).options.includeTests).toBe(false);
            expect((defaultAnalyzer as any).thresholds.cyclomaticComplexity).toEqual([10, 20]);
        });
    });

    describe('analyze', () => {
        it('should create a base result with metrics and issues', () => {
            const content = `
                function test() {
                    let sum = 0;
                    for (let i = 0; i < 10; i++) {
                        for (let j = 0; j < 10; j++) {
                            sum += i * j;
                        }
                    }
                    return sum;
                }
            `;

            const result = analyzer.analyze(content, 'test.js');

            expect(result).toBeDefined();
            expect(result.filePath).toBe('test.js');
            expect(result.fileSize).toBeGreaterThan(0);
            expect(result.metrics).toBeDefined();
            expect(result.issues.length).toBeGreaterThan(0);

            // Should detect nested loops as an anti-pattern
            const nestedLoopIssue = result.issues.find(issue => issue.title === 'Nested Loops');
            expect(nestedLoopIssue).toBeDefined();
        });
    });

    describe('calculateBaseMetrics', () => {
        it('should calculate basic metrics for a file', () => {
            const content = `
                // This is a comment
                function test() {
                    // Another comment
                    return true;
                }

                // Third comment
            `;

            const metrics = analyzer.testCalculateBaseMetrics(content);

            expect(metrics.totalLines).toBe(8);
            expect(metrics.nonEmptyLines).toBe(7);
            expect(metrics.commentLines).toBe(3);
            expect(metrics.commentRatio).toBeCloseTo((3 / 7) * 100, 2);
        });

        it('should handle empty content', () => {
            const metrics = analyzer.testCalculateBaseMetrics('');

            expect(metrics.totalLines).toBe(1);
            expect(metrics.nonEmptyLines).toBe(0);
            expect(metrics.commentLines).toBe(0);
            expect(metrics.commentRatio).toBe(0);
        });
    });

    describe('extractCodeSnippet', () => {
        it('should extract code around the given line with context', () => {
            const lines = [
                'line 1',
                'line 2',
                'line 3',
                'line 4',
                'line 5',
                'line 6',
                'line 7'
            ];

            const snippet = analyzer.testExtractCodeSnippet(lines, 3, 2);

            expect(snippet).toBe('line 2\nline 3\nline 4\nline 5\nline 6');
        });

        it('should handle start of file boundaries', () => {
            const lines = ['line 1', 'line 2', 'line 3'];

            const snippet = analyzer.testExtractCodeSnippet(lines, 0, 2);

            expect(snippet).toBe('line 1\nline 2\nline 3');
        });

        it('should handle end of file boundaries', () => {
            const lines = ['line 1', 'line 2', 'line 3'];

            const snippet = analyzer.testExtractCodeSnippet(lines, 2, 2);

            expect(snippet).toBe('line 1\nline 2\nline 3');
        });
    });

    describe('findLineNumber', () => {
        it('should find the correct line number for an index', () => {
            const content = 'line 1\nline 2\nline 3\nline 4';

            expect(analyzer.testFindLineNumber(content, 0)).toBe(0);
            expect(analyzer.testFindLineNumber(content, 7)).toBe(1);
            expect(analyzer.testFindLineNumber(content, 14)).toBe(2);
            expect(analyzer.testFindLineNumber(content, 21)).toBe(3);
        });

        it('should handle empty content', () => {
            expect(analyzer.testFindLineNumber('', 0)).toBe(0);
        });
    });

    describe('shouldAnalyzeFile', () => {
        it('should exclude test files when includeTests is false', () => {
            expect(analyzer.testShouldAnalyzeFile('file.test.js')).toBe(false);
            expect(analyzer.testShouldAnalyzeFile('file.spec.js')).toBe(false);
            expect(analyzer.testShouldAnalyzeFile('test_file.py')).toBe(false);
            expect(analyzer.testShouldAnalyzeFile('file_test.py')).toBe(false);
        });

        it('should include test files when includeTests is true', () => {
            analyzer = new TestAnalyzer({
                ...defaultOptions,
                includeTests: true
            });

            expect(analyzer.testShouldAnalyzeFile('file.test.js')).toBe(true);
            expect(analyzer.testShouldAnalyzeFile('file.spec.js')).toBe(true);
            expect(analyzer.testShouldAnalyzeFile('test_file.py')).toBe(true);
        });

        it('should exclude files matching excludePatterns', () => {
            expect(analyzer.testShouldAnalyzeFile('node_modules/file.js')).toBe(false);

            analyzer = new TestAnalyzer({
                ...defaultOptions,
                excludePatterns: ['**/*.min.js', '**/vendor/**']
            });

            expect(analyzer.testShouldAnalyzeFile('file.min.js')).toBe(false);
            expect(analyzer.testShouldAnalyzeFile('vendor/lib.js')).toBe(false);
            expect(analyzer.testShouldAnalyzeFile('src/app.js')).toBe(true);
        });
    });

    describe('calculateContentHash', () => {
        it('should generate consistent hashes for the same content', () => {
            const content = 'test content';

            const hash1 = analyzer.testCalculateContentHash(content);
            const hash2 = analyzer.testCalculateContentHash(content);

            expect(hash1).toBe(hash2);
        });

        it('should generate different hashes for different content', () => {
            const hash1 = analyzer.testCalculateContentHash('content1');
            const hash2 = analyzer.testCalculateContentHash('content2');

            expect(hash1).not.toBe(hash2);
        });
    });

    describe('estimateMaxNestedDepth', () => {
        it('should correctly calculate nesting depth for braces', () => {
            const content = `
                function test() {
                    if (true) {
                        for (let i = 0; i < 10; i++) {
                            if (i % 2 === 0) {
                                console.log(i);
                            }
                        }
                    }
                }
            `;

            const depth = analyzer.testEstimateMaxNestedDepth(content);

            expect(depth).toBe(4); // function -> if -> for -> if
        });

        it('should handle unbalanced braces correctly', () => {
            const content = `
                function test() {
                    if (true) {
                        console.log('test');
                    } // This closing brace
                } // And this one
                // But there's no opening brace for this one }
            `;

            const depth = analyzer.testEstimateMaxNestedDepth(content);

            // Should still calculate based on actual nesting
            expect(depth).toBe(2); // function -> if
        });
    });

    describe('analyzeComplexity', () => {
        it('should count control flow statements for complexity', () => {
            const content = `
                function test(value) {
                    if (value > 0) {
                        return true;
                    } else if (value < 0) {
                        return false;
                    } else {
                        for (let i = 0; i < 10; i++) {
                            while (condition) {
                                doSomething();
                            }
                        }
                    }

                    try {
                        riskyOperation();
                    } catch (error) {
                        handleError();
                    }

                    return value ? 'positive' : 'non-positive';
                }
            `;

            const lines = content.split('\n');
            const complexity = analyzer.testAnalyzeComplexity(content, lines);

            // Should detect if, else if, else, for, while, catch, ternary
            expect(complexity).toBeGreaterThanOrEqual(7);
        });
    });

    describe('analyzeNesting', () => {
        it('should calculate maximum nesting depth', () => {
            const content = `
                function outer() {
                    function inner() {
                        if (condition) {
                            for (let i = 0; i < 10; i++) {
                                // Deep nesting
                            }
                        }
                    }
                }
            `;

            const nesting = analyzer.testAnalyzeNesting(content);

            expect(nesting).toBe(4); // function -> function -> if -> for
        });
    });

    describe('analyzeResourceUsage', () => {
        it('should detect large object literals', () => {
            const content = `
                const largeObject = {
                    ${'prop1: "value1", '.repeat(100)}
                    lastProp: "lastValue"
                };
            `;

            const lines = content.split('\n');
            const issues = analyzer.testAnalyzeResourceUsage(content, lines);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].title).toBe('Large Object Literal');
        });

        it('should detect memory-intensive operations in loops', () => {
            const content = `
                function processItems(items) {
                    for (const item of items) {
                        const data = JSON.parse(item.data);
                        // Process data
                    }
                }
            `;

            const lines = content.split('\n');
            const issues = analyzer.testAnalyzeResourceUsage(content, lines);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].title).toBe('Memory-Intensive Loop Operation');
        });
    });

    describe('analyzeCommonAntiPatterns', () => {
        it('should detect nested loops', () => {
            const content = `
                function findMatches(items, others) {
                    for (const item of items) {
                        for (const other of others) {
                            if (item.id === other.id) {
                                console.log('Match found!');
                            }
                        }
                    }
                }
            `;

            const lines = content.split('\n');
            const issues = analyzer.testAnalyzeCommonAntiPatterns(content, lines);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].title).toBe('Nested Loops');
        });

        it('should detect unsafe recursion', () => {
            const content = `
                function recurse(data) {
                    return recurse(process(data));
                }
            `;

            const lines = content.split('\n');
            const issues = analyzer.testAnalyzeCommonAntiPatterns(content, lines);

            expect(issues.length).toBeGreaterThan(0);
            expect(issues[0].title).toBe('Unsafe Recursion');
        });

        it('should not flag safe recursion with base case', () => {
            const content = `
                function factorial(n) {
                    if (n <= 1) {
                        return 1;
                    }
                    return n * factorial(n - 1);
                }
            `;

            const lines = content.split('\n');
            const issues = analyzer.testAnalyzeCommonAntiPatterns(content, lines);

            // Should not detect unsafe recursion because it has a base case
            const unsafeRecursionIssue = issues.find(issue => issue.title === 'Unsafe Recursion');
            expect(unsafeRecursionIssue).toBeUndefined();
        });
    });
});
