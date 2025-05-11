const BasePerformanceAnalyzer = require('../baseAnalyzer');
const path = require('path');

// Concrete implementation of the abstract class for testing
class TestAnalyzer extends BasePerformanceAnalyzer {
    analyze(fileContent, filePath) {
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
    testCalculateBaseMetrics(content) {
        return this.calculateBaseMetrics(content);
    }

    testExtractCodeSnippet(lines, lineIndex, contextLines = 3) {
        return this.extractCodeSnippet(lines, lineIndex, contextLines);
    }

    testFindLineNumber(content, index) {
        return this.findLineNumber(content, index);
    }

    testShouldAnalyzeFile(filePath) {
        return this.shouldAnalyzeFile(filePath);
    }

    testCalculateContentHash(content) {
        return this.calculateContentHash(content);
    }

    testEstimateMaxNestedDepth(content) {
        return this.estimateMaxNestedDepth(content);
    }

    testAnalyzeComplexity(fileContent, lines) {
        return this.analyzeComplexity(fileContent, lines);
    }

    testAnalyzeNesting(fileContent) {
        return this.analyzeNesting(fileContent);
    }

    testAnalyzeResourceUsage(fileContent, lines) {
        return this.analyzeResourceUsage(fileContent, lines);
    }

    testAnalyzeCommonAntiPatterns(fileContent, lines) {
        return this.analyzeCommonAntiPatterns(fileContent, lines);
    }
}

describe('BasePerformanceAnalyzer (JS)', () => {
    let analyzer;
    let defaultOptions;

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
            const customOptions = {
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

            // In JavaScript we can directly access the properties
            expect(customAnalyzer.options).toEqual(customOptions);
            expect(customAnalyzer.thresholds).toEqual(customOptions.thresholds);
        });

        it('should use default options when none are provided', () => {
            const defaultAnalyzer = new TestAnalyzer();

            // Verify default values match expected defaults
            expect(defaultAnalyzer.options.maxFileSize).toBe(1024 * 1024);
            expect(defaultAnalyzer.options.excludePatterns).toContain('**/node_modules/**');
            expect(defaultAnalyzer.options.includeTests).toBe(false);
            expect(defaultAnalyzer.thresholds.cyclomaticComplexity).toEqual([10, 20]);
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

    describe('JavaScript-specific tests', () => {
        it('should handle dynamic properties', () => {
            // In JavaScript we can add properties dynamically
            analyzer.customProperty = 'test';
            expect(analyzer.customProperty).toBe('test');

            // We can also modify the prototype
            TestAnalyzer.prototype.customMethod = function() {
                return 'custom method result';
            };

            expect(analyzer.customMethod()).toBe('custom method result');
        });

        it('should work with JavaScript prototypal inheritance', () => {
            // Create a subclass in JavaScript style
            function ExtendedAnalyzer() {
                TestAnalyzer.call(this, defaultOptions);
                this.additionalProperty = 'extended';
            }

            ExtendedAnalyzer.prototype = Object.create(TestAnalyzer.prototype);
            ExtendedAnalyzer.prototype.constructor = ExtendedAnalyzer;

            // Add a new method
            ExtendedAnalyzer.prototype.getAdditionalProperty = function() {
                return this.additionalProperty;
            };

            const extendedAnalyzer = new ExtendedAnalyzer();

            // Should have inherited methods
            expect(typeof extendedAnalyzer.analyze).toBe('function');
            expect(extendedAnalyzer.getAdditionalProperty()).toBe('extended');
        });

        it('should handle various JavaScript value types', () => {
            // JavaScript has dynamic types
            const testValues = [
                undefined,
                null,
                0,
                '',
                false,
                NaN,
                Infinity,
                Symbol('test'),
                { key: 'value' },
                [1, 2, 3],
                function() {},
                new Date()
            ];

            // This would likely fail in TypeScript with strict typing
            testValues.forEach(value => {
                // Just verify we can call methods with various types without TypeScript errors
                const content = String(value || '');
                analyzer.testCalculateBaseMetrics(content);
                analyzer.testCalculateContentHash(content);
            });
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
});
