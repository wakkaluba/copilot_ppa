import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { PerformanceAnalysisResult, LanguageMetricThresholds } from '../types';

export class PythonAnalyzer extends BasePerformanceAnalyzer {
    protected override thresholds: LanguageMetricThresholds = {
        cyclomaticComplexity: [10, 20],
        nestedBlockDepth: [3, 5],
        functionLength: [50, 100],
        parameterCount: [4, 7],
        maintainabilityIndex: [65, 85],
        commentRatio: [10, 20]
    };

    private readonly memoryPatterns = {
        listComprehension: /\[.*for.*in.*\]/g,
        generatorExpression: /\(.*for.*in.*\)/g,
        largeContainerCreation: /(?:list|set|dict)\s*\(\s*range\s*\(\s*\d+\s*\)\s*\)/g,
        mutableDefaultArgs: /def\s+\w+\s*\([^)]*(?:list|dict|set)\s*\(\s*\)\s*(?:,|\))/g,
        globalVariables: /global\s+\w+/g,
        recursiveFunction: /def\s+(\w+)[^(]*\([^)]*\):[^#]*\1\s*\(/g
    };

    private readonly performancePatterns = {
        stringConcatenation: /(?:"\s*\+\s*"|'\s*\+\s*')/g,
        listConcatenation: /for\s+\w+\s+in\s+.+:\s*\n\s+\w+\s*\+=/g,
        nestedLoops: /for\s+\w+\s+in\s+.+:\s*\n\s+for\s+\w+\s+in\s+.+:\s*\n\s+\w+\.append/g,
        repeatedMethodCalls: /(\w+\.\w+\([^)]*\).*){3,}/g,
        multipleListSlicing: /\[.*\]\s*\[.*\]\s*\[.*\]/g
    };

    public analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        const result = this.createBaseResult(fileContent, filePath);
        const lines = fileContent.split('\n');

        // Core analysis steps
        this.analyzeMemoryPatterns(fileContent, lines, result);
        this.analyzePerformancePatterns(fileContent, lines, result);
        this.analyzeComprehensions(fileContent, lines, result);
        this.analyzeGeneratorUsage(fileContent, lines, result);
        this.analyzeDataStructures(fileContent, lines, result);
        this.analyzePythonSpecifics(fileContent, lines, result);
        
        // Calculate and merge metrics
        const metrics = this.calculatePythonMetrics(fileContent);
        result.metrics = { ...result.metrics, ...metrics };
        
        return result;
    }

    private analyzeMemoryPatterns(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check mutable default arguments
        let match;
        while ((match = this.memoryPatterns.mutableDefaultArgs.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Mutable Default Argument',
                description: 'Using mutable default arguments can lead to unexpected behavior',
                severity: 'high',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use None as default and initialize mutable objects inside the function',
                solutionCode: '# Instead of:\ndef func(lst=[]):\n    lst.append(1)\n\n# Use:\ndef func(lst=None):\n    if lst is None:\n        lst = []'
            });
        }

        // Check large container creation
        while ((match = this.memoryPatterns.largeContainerCreation.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient Large Container Creation',
                description: 'Creating large containers with range() can consume unnecessary memory',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use generator expressions or range directly as an iterator',
                solutionCode: '# Instead of:\ndata = list(range(1000000))\n\n# Use:\ndata = range(1000000)  # This is a memory-efficient iterator'
            });
        }

        // Check global variables
        while ((match = this.memoryPatterns.globalVariables.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Global Variable Usage',
                description: 'Global variables can lead to memory leaks and make code harder to maintain',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Consider using class attributes or passing variables as parameters',
                solutionCode: '# Instead of:\nglobal_var = []\ndef func():\n    global global_var\n\n# Use:\nclass MyClass:\n    def __init__(self):\n        self.data = []'
            });
        }
    }

    private analyzePerformancePatterns(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check string concatenation
        let match;
        while ((match = this.performancePatterns.stringConcatenation.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient String Concatenation',
                description: 'Using + operator for string concatenation is inefficient',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Use string formatting, f-strings, or str.join()',
                solutionCode: '# Instead of:\nresult = "Hello, " + name + "!"\n\n# Use:\nresult = f"Hello, {name}!"\n# Or:\nresult = "Hello, {}!".format(name)'
            });
        }

        // Check repeated method calls
        while ((match = this.performancePatterns.repeatedMethodCalls.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Repeated Method Calls',
                description: 'Multiple calls to the same method could be optimized',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Store method result in a variable if used multiple times',
                solutionCode: '# Instead of:\nif obj.expensive_method() and obj.expensive_method() > 0:\n    use(obj.expensive_method())\n\n# Use:\nresult = obj.expensive_method()\nif result and result > 0:\n    use(result)'
            });
        }

        // Check multiple list slicing
        while ((match = this.performancePatterns.multipleListSlicing.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Multiple List Slicing',
                description: 'Multiple list slicing operations create unnecessary copies',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Combine slicing operations or use itertools',
                solutionCode: '# Instead of:\ndata = list[1:10][2:8][1:4]\n\n# Use:\ndata = list[3:9:2]  # Calculate the combined slice\n# Or:\nfrom itertools import islice\ndata = list(islice(list, 3, 9, 2))'
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

    private analyzeDataStructures(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for appropriate data structure usage
        const patterns = {
            listForLookup: /for\s+\w+\s+in\s+\w+:\s*\n\s+if\s+\w+\s*==\s*\w+/g,
            listForUnique: /set\s*\(\s*\w+\s*\)/g,
            dictComprehension: /\{[^:]+:[^}]+for[^}]+\}/g
        };

        let match;
        while ((match = patterns.listForLookup.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Inefficient List Lookup',
                description: 'Using list for lookups is inefficient. Consider using a set or dictionary.',
                severity: 'medium',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Convert list to set or dict for O(1) lookups',
                solutionCode: '# Instead of:\nitems = [1, 2, 3, 4]\nfor x in range(1000):\n    if x in items:  # O(n)\n\n# Use:\nitems_set = set([1, 2, 3, 4])\nfor x in range(1000):\n    if x in items_set:  # O(1)'
            });
        }
    }

    private analyzePythonSpecifics(fileContent: string, lines: string[], result: PerformanceAnalysisResult): void {
        // Check for missing type hints
        const noTypeHints = /def\s+\w+\s*\([^:)]*\)\s*:/g;
        let match;
        while ((match = noTypeHints.exec(fileContent)) !== null) {
            const lineIndex = this.findLineNumber(fileContent, match.index);
            result.issues.push({
                title: 'Missing Type Hints',
                description: 'Functions without type hints can hide performance issues',
                severity: 'low',
                line: lineIndex + 1,
                code: this.extractCodeSnippet(lines, lineIndex, 3),
                solution: 'Add type hints to improve code maintainability and catch type-related issues',
                solutionCode: '# Instead of:\ndef process_data(data):\n    return data.copy()\n\n# Use:\nfrom typing import List\ndef process_data(data: List[int]) -> List[int]:\n    return data.copy()'
            });
        }

        // Other Python-specific checks...
    }

    private calculatePythonMetrics(content: string): Record<string, number> {
        return {
            functionCount: (content.match(/def\s+\w+\s*\(/g) || []).length,
            classCount: (content.match(/class\s+\w+\s*(?:\([^)]*\))?\s*:/g) || []).length,
            decoratorCount: (content.match(/@\w+/g) || []).length,
            generatorCount: (content.match(/yield\s+/g) || []).length,
            comprehensionCount: (content.match(/\[.*for.*in.*\]/g) || []).length,
            importCount: (content.match(/^import\s+|\s*from\s+.*import/gm) || []).length,
            asyncFunctionCount: (content.match(/async\s+def/g) || []).length,
            typeHintCount: (content.match(/\w+\s*:\s*\w+/g) || []).length,
            withStatementCount: (content.match(/with\s+/g) || []).length,
            exceptionHandlerCount: (content.match(/except\s+/g) || []).length
        };
    }
}