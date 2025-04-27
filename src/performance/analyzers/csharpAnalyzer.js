"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CSharpAnalyzer = void 0;
var baseAnalyzer_1 = require("./baseAnalyzer");
var CSharpAnalyzer = /** @class */ (function (_super) {
    __extends(CSharpAnalyzer, _super);
    function CSharpAnalyzer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    CSharpAnalyzer.prototype.analyze = function (fileContent, filePath) {
        var result = this.createBaseResult(fileContent, filePath);
        var lines = fileContent.split('\n');
        this.analyzeLINQOperations(fileContent, lines, result);
        this.analyzeStringOperations(fileContent, lines, result);
        this.analyzeDisposableUsage(fileContent, lines, result);
        this.analyzeAsyncAwait(fileContent, lines, result);
        this.analyzeLoopAllocations(fileContent, lines, result);
        var metrics = this.calculateCSharpMetrics(fileContent);
        result.metrics = __assign(__assign({}, result.metrics), metrics);
        return result;
    };
    CSharpAnalyzer.prototype.analyzeLINQOperations = function (fileContent, lines, result) {
        var inefficientLinqRegex = /\.Select\([^)]+\)\.Where\([^)]+\)/g;
        var match;
        while ((match = inefficientLinqRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    CSharpAnalyzer.prototype.analyzeStringOperations = function (fileContent, lines, result) {
        var stringBuilderRegex = /for\s*\([^)]+\)\s*{[^}]*?\+=/gs;
        var match;
        while ((match = stringBuilderRegex.exec(fileContent)) !== null) {
            if (!match[0].includes('StringBuilder')) {
                var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    CSharpAnalyzer.prototype.analyzeDisposableUsage = function (fileContent, lines, result) {
        var disposableRegex = /new\s+(SqlConnection|FileStream|StreamReader|StreamWriter)[^{;]*(?!using)/g;
        var match;
        while ((match = disposableRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    CSharpAnalyzer.prototype.analyzeAsyncAwait = function (fileContent, lines, result) {
        var syncOverAsyncRegex = /\.Result|\\.Wait\(\)/g;
        var match;
        while ((match = syncOverAsyncRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    CSharpAnalyzer.prototype.analyzeLoopAllocations = function (fileContent, lines, result) {
        var newInLoopRegex = /(?:for|foreach)\s*\([^{]+\{\s*[^}]*?new\s+(?!Exception|StringBuilder|DateTime)\w+/g;
        var match;
        while ((match = newInLoopRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    CSharpAnalyzer.prototype.calculateCSharpMetrics = function (content) {
        var lines = content.split('\n');
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
    };
    CSharpAnalyzer.prototype.calculateAverageMethodLength = function (content) {
        var _this = this;
        var methodRegex = /\b(public|private|protected)\s+[\w<>[\]]+\s+\w+\s*\([^{]*\{/g;
        var methods = content.match(methodRegex);
        if (!methods) {
            return 0;
        }
        var totalLines = 0;
        var methodCount = 0;
        var lines = content.split('\n');
        methods.forEach(function (method) {
            var startIndex = content.indexOf(method);
            var lineIndex = _this.findLineNumber(content, startIndex);
            var bracketCount = 1;
            var currentLine = lineIndex;
            while (bracketCount > 0 && currentLine < lines.length) {
                var line = lines[currentLine];
                bracketCount += (line.match(/{/g) || []).length;
                bracketCount -= (line.match(/}/g) || []).length;
                currentLine++;
            }
            totalLines += currentLine - lineIndex;
            methodCount++;
        });
        return Math.round(totalLines / methodCount);
    };
    return CSharpAnalyzer;
}(baseAnalyzer_1.BasePerformanceAnalyzer));
exports.CSharpAnalyzer = CSharpAnalyzer;
