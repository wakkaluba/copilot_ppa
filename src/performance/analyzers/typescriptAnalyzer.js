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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TypeScriptAnalyzer = void 0;
var inversify_1 = require("inversify");
var baseAnalyzer_1 = require("./baseAnalyzer");
var ILogger_1 = require("../../logging/ILogger");
var TypeScriptPatternAnalyzer_1 = require("./services/TypeScriptPatternAnalyzer");
var TypeScriptMetricsCalculator_1 = require("./services/TypeScriptMetricsCalculator");
var TypeScriptAnalyzer = /** @class */ (function (_super) {
    __extends(TypeScriptAnalyzer, _super);
    function TypeScriptAnalyzer(logger, patternAnalyzer, metricsCalculator, options) {
        var _this = _super.call(this, options) || this;
        _this.logger = logger;
        _this.patternAnalyzer = patternAnalyzer;
        _this.metricsCalculator = metricsCalculator;
        return _this;
    }
    TypeScriptAnalyzer.prototype.analyze = function (fileContent, filePath) {
        var _a;
        try {
            var result = this.createBaseResult(fileContent, filePath);
            var lines = fileContent.split('\n');
            // Analyze patterns and add issues
            (_a = result.issues).push.apply(_a, __spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray(__spreadArray([], this.patternAnalyzer.analyzeTypeScriptPatterns(fileContent, lines), false), this.analyzeArrayOperations(fileContent, lines), false), this.analyzeAsyncPatterns(fileContent, lines), false), this.analyzeMemoryUsage(fileContent, lines), false), this.analyzeDOMOperations(fileContent, lines), false), this.analyzeEventHandlers(fileContent, lines), false), this.analyzeCommonAntiPatterns(fileContent, lines), false));
            // Calculate and merge metrics
            result.metrics = __assign(__assign({}, result.metrics), this.metricsCalculator.calculateMetrics(fileContent));
            return result;
        }
        catch (error) {
            this.logger.error('Error analyzing TypeScript file:', error);
            return this.createErrorResult(fileContent, filePath, error);
        }
    };
    TypeScriptAnalyzer.prototype.analyzeArrayOperations = function (fileContent, lines, result) {
        // Check for array concatenation in loops
        var arrayOpRegex = /for\s*\([^)]+\)\s*\{[^}]*?\.concat\(/gs;
        var match;
        while ((match = arrayOpRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
        var indexOfInLoopRegex = /for\s*\([^)]+\)\s*\{[^}]*?\.indexOf\([^)]+\)/gs;
        while ((match = indexOfInLoopRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    TypeScriptAnalyzer.prototype.analyzeAsyncPatterns = function (fileContent, lines, result) {
        // Check for Promise.all usage with large arrays
        var promiseAllRegex = /Promise\.all\(\s*(\w+)\.map/g;
        var match;
        while ((match = promiseAllRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    TypeScriptAnalyzer.prototype.analyzeMemoryUsage = function (fileContent, lines, result) {
        // Check for closure memory leaks
        var closureLeakRegex = /setInterval\(\s*function\s*\([^)]*\)\s*\{[^}]*?this\./g;
        var match;
        while ((match = closureLeakRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    TypeScriptAnalyzer.prototype.analyzeDOMOperations = function (fileContent, lines, result) {
        // Check for frequent DOM updates
        var domUpdateRegex = /for\s*\([^)]+\)\s*\{[^}]*?(innerHTML|appendChild|removeChild)/g;
        var match;
        while ((match = domUpdateRegex.exec(fileContent)) !== null) {
            var lineIndex = this.findLineNumber(fileContent, match.index);
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
    };
    TypeScriptAnalyzer.prototype.analyzeEventHandlers = function (fileContent, lines, result) {
        // Check for unbounded event listeners
        var eventListenerRegex = /addEventListener\([^)]+\)/g;
        var removeListenerRegex = /removeEventListener\([^)]+\)/g;
        var addCount = (fileContent.match(eventListenerRegex) || []).length;
        var removeCount = (fileContent.match(removeListenerRegex) || []).length;
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
    };
    TypeScriptAnalyzer.prototype.calculateTypeScriptMetrics = function (content) {
        var lines = content.split('\n');
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
    };
    TypeScriptAnalyzer.prototype.calculateAverageMethodLength = function (content) {
        var _this = this;
        var methodRegex = /\b(public|private|protected|async)?\s*\w+\s*\([^)]*\)\s*{/g;
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
    var _a;
    TypeScriptAnalyzer = __decorate([
        (0, inversify_1.injectable)(),
        __param(0, (0, inversify_1.inject)(ILogger_1.ILogger)),
        __param(1, (0, inversify_1.inject)(TypeScriptPatternAnalyzer_1.TypeScriptPatternAnalyzer)),
        __param(2, (0, inversify_1.inject)(TypeScriptMetricsCalculator_1.TypeScriptMetricsCalculator)),
        __metadata("design:paramtypes", [typeof (_a = typeof ILogger_1.ILogger !== "undefined" && ILogger_1.ILogger) === "function" ? _a : Object, TypeScriptPatternAnalyzer_1.TypeScriptPatternAnalyzer,
            TypeScriptMetricsCalculator_1.TypeScriptMetricsCalculator, Object])
    ], TypeScriptAnalyzer);
    return TypeScriptAnalyzer;
}(baseAnalyzer_1.BasePerformanceAnalyzer));
exports.TypeScriptAnalyzer = TypeScriptAnalyzer;
