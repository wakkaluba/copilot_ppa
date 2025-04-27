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
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptAnalyzer = void 0;
var baseAnalyzer_1 = require("./baseAnalyzer");
var parser = require("@babel/parser");
var traverse_1 = require("@babel/traverse");
var JavaScriptAnalyzer = /** @class */ (function (_super) {
    __extends(JavaScriptAnalyzer, _super);
    function JavaScriptAnalyzer(options) {
        var _this = _super.call(this, options) || this;
        _this.thresholds = {
            cyclomaticComplexity: [10, 20],
            nestedBlockDepth: [3, 5],
            functionLength: [100, 200],
            parameterCount: [4, 7],
            maintainabilityIndex: [65, 85],
            commentRatio: [10, 20]
        };
        return _this;
    }
    JavaScriptAnalyzer.prototype.analyze = function (fileContent, filePath) {
        if (!this.shouldAnalyzeFile(filePath)) {
            return this.createBaseResult(fileContent, filePath);
        }
        var result = this.createBaseResult(fileContent, filePath);
        try {
            var ast = this.parseCode(fileContent, filePath);
            this.analyzeAst(ast, fileContent, result);
        }
        catch (error) {
            result.issues.push({
                severity: 'high',
                title: 'Parse Error',
                description: "Failed to parse file: ".concat(error.message),
                line: 1,
                column: 1
            });
        }
        return result;
    };
    JavaScriptAnalyzer.prototype.parseCode = function (content, filePath) {
        var isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
        return parser.parse(content, {
            sourceType: 'module',
            plugins: [
                'jsx',
                isTypeScript ? 'typescript' : 'flow',
                'decorators-legacy',
                'classProperties'
            ]
        });
    };
    JavaScriptAnalyzer.prototype.analyzeAst = function (ast, content, result) {
        var _this = this;
        var complexity = 0;
        var maxDepth = 0;
        var currentDepth = 0;
        (0, traverse_1.default)(ast, {
            enter: function (path) {
                // Track nesting depth
                currentDepth++;
                maxDepth = Math.max(maxDepth, currentDepth);
                // Analyze complexity
                switch (path.node.type) {
                    case 'IfStatement':
                    case 'WhileStatement':
                    case 'ForStatement':
                    case 'ForInStatement':
                    case 'ForOfStatement':
                    case 'ConditionalExpression':
                        complexity++;
                        break;
                    case 'SwitchCase':
                        if (path.node.test) {
                            complexity++;
                        }
                        break;
                    case 'LogicalExpression':
                        if (path.node.operator === '&&' || path.node.operator === '||') {
                            complexity++;
                        }
                        break;
                }
                // Function-specific analysis
                if (path.isFunctionDeclaration() || path.isFunctionExpression() || path.isArrowFunctionExpression()) {
                    _this.analyzeFunctionComplexity(path.node, content, result);
                }
                // Class analysis
                if (path.isClassDeclaration() || path.isClassExpression()) {
                    _this.analyzeClassComplexity(path.node, content, result);
                }
            },
            exit: function () {
                currentDepth--;
            }
        });
        result.metrics.cyclomaticComplexity = complexity;
        result.metrics.maxNestingDepth = maxDepth;
        // Add complexity warning if threshold exceeded
        if (complexity > this.options.thresholds.cyclomaticComplexity[1]) {
            result.issues.push({
                severity: 'high',
                title: 'High Cyclomatic Complexity',
                description: "File has a cyclomatic complexity of ".concat(complexity, ", which exceeds the threshold of ").concat(this.options.thresholds.cyclomaticComplexity[1]),
                line: 1
            });
        }
    };
    JavaScriptAnalyzer.prototype.analyzeFunctionComplexity = function (node, content, result) {
        // Calculate function length
        var start = this.findLineNumber(content, node.start);
        var end = this.findLineNumber(content, node.end);
        var length = end - start + 1;
        if (length > this.options.thresholds.functionLength[1]) {
            result.issues.push({
                severity: 'medium',
                title: 'Long Function',
                description: "Function is ".concat(length, " lines long, which exceeds the recommended maximum of ").concat(this.options.thresholds.functionLength[1], " lines"),
                line: start + 1
            });
        }
        // Check parameter count
        var params = 'params' in node ? node.params.length : 0;
        if (params > this.options.thresholds.parameterCount[1]) {
            result.issues.push({
                severity: 'medium',
                title: 'Too Many Parameters',
                description: "Function has ".concat(params, " parameters, which exceeds the recommended maximum of ").concat(this.options.thresholds.parameterCount[1]),
                line: start + 1
            });
        }
    };
    JavaScriptAnalyzer.prototype.analyzeClassComplexity = function (node, content, result) {
        if ('body' in node && 'body' in node.body) {
            var methods = node.body.body.filter(function (member) {
                return member.type === 'ClassMethod' ||
                    member.type === 'ClassPrivateMethod';
            });
            if (methods.length > 20) {
                var start = this.findLineNumber(content, node.start);
                result.issues.push({
                    severity: 'medium',
                    title: 'Large Class',
                    description: "Class has ".concat(methods.length, " methods, consider breaking it down into smaller classes"),
                    line: start + 1
                });
            }
        }
    };
    JavaScriptAnalyzer.prototype.getCodeContext = function (content, position) {
        var lines = content.split('\n');
        var lineIndex = content.substring(0, position).split('\n').length - 1;
        return this.extractCodeSnippet(lines, lineIndex);
    };
    JavaScriptAnalyzer.prototype.createIssue = function (title, description, severity, line, code, solution, solutionCode) {
        return {
            title: title,
            description: description,
            severity: severity,
            line: line,
            code: code,
            solution: solution,
            solutionCode: solutionCode
        };
    };
    JavaScriptAnalyzer.prototype.findLineNumber = function (content, position) {
        return content.substring(0, position).split('\n').length;
    };
    JavaScriptAnalyzer.prototype.calculateConditionalComplexity = function (content) {
        var conditions = content.match(/if\s*\(|else\s+if\s*\(|\?\s*[^:]+\s*:/g) || [];
        var switches = content.match(/switch\s*\([^{]+\)\s*{[^}]+}/g) || [];
        var ternaries = content.match(/\?[^:]+:/g) || [];
        return conditions.length + switches.length + ternaries;
    };
    return JavaScriptAnalyzer;
}(baseAnalyzer_1.BasePerformanceAnalyzer));
exports.JavaScriptAnalyzer = JavaScriptAnalyzer;
