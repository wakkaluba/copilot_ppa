"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BasePerformanceAnalyzer = void 0;
var path = require("path");
var BasePerformanceAnalyzer = /** @class */ (function () {
    function BasePerformanceAnalyzer(options) {
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
    BasePerformanceAnalyzer.prototype.createBaseResult = function (fileContent, filePath) {
        return {
            filePath: filePath,
            fileSize: Buffer.from(fileContent).length,
            issues: [],
            metrics: this.calculateBaseMetrics(fileContent)
        };
    };
    BasePerformanceAnalyzer.prototype.calculateBaseMetrics = function (content) {
        var lines = content.split('\n');
        var nonEmptyLines = lines.filter(function (line) { return line.trim().length > 0; });
        var commentLines = lines.filter(function (line) { return line.trim().startsWith('//') || line.trim().startsWith('#') || line.trim().startsWith('/*'); });
        return {
            totalLines: lines.length,
            nonEmptyLines: nonEmptyLines.length,
            commentLines: commentLines.length,
            commentRatio: (commentLines.length / nonEmptyLines.length) * 100 || 0
        };
    };
    BasePerformanceAnalyzer.prototype.extractCodeSnippet = function (lines, lineIndex, contextLines) {
        if (contextLines === void 0) { contextLines = 3; }
        var start = Math.max(0, lineIndex - contextLines);
        var end = Math.min(lines.length, lineIndex + contextLines + 1);
        return lines.slice(start, end).join('\n');
    };
    BasePerformanceAnalyzer.prototype.findLineNumber = function (content, index) {
        return content.substring(0, index).split('\n').length - 1;
    };
    BasePerformanceAnalyzer.prototype.shouldAnalyzeFile = function (filePath) {
        if (!this.options.includeTests && this.isTestFile(filePath)) {
            return false;
        }
        for (var _i = 0, _a = this.options.excludePatterns; _i < _a.length; _i++) {
            var pattern = _a[_i];
            if (this.matchesGlobPattern(filePath, pattern)) {
                return false;
            }
        }
        return true;
    };
    BasePerformanceAnalyzer.prototype.isTestFile = function (filePath) {
        var fileName = path.basename(filePath).toLowerCase();
        return fileName.includes('.test.') ||
            fileName.includes('.spec.') ||
            fileName.startsWith('test_') ||
            fileName.endsWith('_test.py');
    };
    BasePerformanceAnalyzer.prototype.matchesGlobPattern = function (filePath, pattern) {
        var regexPattern = pattern
            .replace(/\./g, '\\.')
            .replace(/\*/g, '.*')
            .replace(/\?/g, '.');
        return new RegExp("^".concat(regexPattern, "$")).test(filePath);
    };
    BasePerformanceAnalyzer.prototype.calculateContentHash = function (content) {
        var hash = 0;
        for (var i = 0; i < content.length; i++) {
            var char = content.charCodeAt(i);
            hash = ((hash << 5) - hash) + char;
            hash = hash & hash;
        }
        return hash.toString(16);
    };
    BasePerformanceAnalyzer.prototype.estimateMaxNestedDepth = function (content) {
        var lines = content.split('\n');
        var maxDepth = 0;
        var currentDepth = 0;
        for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
            var line = lines_1[_i];
            var openBrackets = (line.match(/{/g) || []).length;
            var closeBrackets = (line.match(/}/g) || []).length;
            currentDepth += openBrackets - closeBrackets;
            maxDepth = Math.max(maxDepth, currentDepth);
        }
        return maxDepth;
    };
    BasePerformanceAnalyzer.prototype.analyzeComplexity = function (fileContent, lines) {
        var complexity = 0;
        var controlFlowKeywords = [
            /\bif\b/, /\belse\b/, /\bfor\b/, /\bwhile\b/, /\bdo\b/,
            /\bswitch\b/, /\bcase\b/, /\bcatch\b/, /\b\?\b/, /\?\./,
            /\?\?/, /\|\|/, /&&/
        ];
        lines.forEach(function (line) {
            controlFlowKeywords.forEach(function (keyword) {
                if (keyword.test(line)) {
                    complexity++;
                }
            });
        });
        return complexity;
    };
    BasePerformanceAnalyzer.prototype.analyzeNesting = function (fileContent) {
        var maxNesting = 0;
        var currentNesting = 0;
        var lines = fileContent.split('\n');
        lines.forEach(function (line) {
            var openBraces = (line.match(/{/g) || []).length;
            var closeBraces = (line.match(/}/g) || []).length;
            currentNesting += openBraces - closeBraces;
            maxNesting = Math.max(maxNesting, currentNesting);
        });
        return maxNesting;
    };
    BasePerformanceAnalyzer.prototype.analyzeResourceUsage = function (fileContent, lines) {
        var issues = [];
        // Check for large object literals
        var largeObjectRegex = /{[^}]{1000,}}/g;
        var match;
        while ((match = largeObjectRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
        var memoryIntensiveLoops = /for\s*\([^)]+\)\s*\{[^}]*?(new Array|new Object|JSON\.parse|JSON\.stringify)/g;
        while ((match = memoryIntensiveLoops.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    BasePerformanceAnalyzer.prototype.analyzeCommonAntiPatterns = function (fileContent, lines) {
        var issues = [];
        // Check for nested loops
        var nestedLoopRegex = /for\s*\([^{]+\{[^}]*for\s*\([^{]+\{/g;
        var match;
        while ((match = nestedLoopRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
        var recursiveRegex = /function\s+(\w+)[^{]*\{[^}]*\1\s*\(/g;
        while ((match = recursiveRegex.exec(fileContent)) !== null) {
            if (!fileContent.includes('return') || !fileContent.includes('if')) {
                var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    return BasePerformanceAnalyzer;
}());
exports.BasePerformanceAnalyzer = BasePerformanceAnalyzer;
