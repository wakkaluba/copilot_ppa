"use strict";
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DependencyAnalyzer = exports.MetricsCalculator = exports.ComplexityAnalyzer = void 0;
var ts = require("typescript");
var ComplexityAnalyzer = /** @class */ (function () {
    function ComplexityAnalyzer() {
        this.COMPLEXITY_THRESHOLD = {
            LOW: 10,
            MEDIUM: 20,
            HIGH: 30
        };
        this.metricsCalculator = new MetricsCalculator();
        this.dependencyAnalyzer = new DependencyAnalyzer();
    }
    ComplexityAnalyzer.prototype.analyzeCode = function (document) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceFile, metrics;
            return __generator(this, function (_a) {
                sourceFile = ts.createSourceFile(document.fileName, document.getText(), ts.ScriptTarget.Latest, true);
                metrics = this.analyzeNode(sourceFile);
                return [2 /*return*/, __assign(__assign({}, metrics), { maintainabilityIndex: this.metricsCalculator.calculateMaintainabilityIndex(document.getText()), lineCount: document.lineCount })];
            });
        });
    };
    ComplexityAnalyzer.prototype.analyzeFunction = function (document, functionName) {
        return __awaiter(this, void 0, void 0, function () {
            var sourceFile, functionNode, metrics, dependencies;
            return __generator(this, function (_a) {
                sourceFile = ts.createSourceFile(document.fileName, document.getText(), ts.ScriptTarget.Latest, true);
                functionNode = this.findFunctionNode(sourceFile, functionName);
                if (!functionNode) {
                    return [2 /*return*/, null];
                }
                metrics = this.analyzeNode(functionNode);
                dependencies = this.dependencyAnalyzer.analyzeDependencies(functionNode);
                return [2 /*return*/, __assign(__assign({}, metrics), { name: functionName, parameters: this.dependencyAnalyzer.getParameters(functionNode), returnType: this.dependencyAnalyzer.getReturnType(functionNode), dependencies: dependencies })];
            });
        });
    };
    ComplexityAnalyzer.prototype.analyzeMetrics = function (code) {
        var sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
        return this.analyzeNode(sourceFile);
    };
    ComplexityAnalyzer.prototype.getComplexityGrade = function (complexity) {
        if (complexity <= this.COMPLEXITY_THRESHOLD.LOW) {
            return 'Low';
        }
        if (complexity <= this.COMPLEXITY_THRESHOLD.MEDIUM) {
            return 'Medium';
        }
        return 'High';
    };
    ComplexityAnalyzer.prototype.analyzeNode = function (node) {
        return {
            cyclomaticComplexity: this.metricsCalculator.calculateCyclomaticComplexity(node),
            maintainabilityIndex: this.metricsCalculator.calculateMaintainabilityIndex(node.getText()),
            cognitiveComplexity: this.metricsCalculator.calculateCognitiveComplexity(node),
            halsteadDifficulty: this.metricsCalculator.calculateHalsteadDifficulty(node),
            lineCount: node.getFullText().split('\n').length,
            nestingDepth: this.metricsCalculator.calculateNestingDepth(node)
        };
    };
    ComplexityAnalyzer.prototype.findFunctionNode = function (sourceFile, functionName) {
        var functionNode = null;
        var visit = function (node) {
            var _a;
            if (ts.isFunctionDeclaration(node) && ((_a = node.name) === null || _a === void 0 ? void 0 : _a.text) === functionName) {
                functionNode = node;
                return;
            }
            ts.forEachChild(node, visit);
        };
        ts.forEachChild(sourceFile, visit);
        return functionNode;
    };
    return ComplexityAnalyzer;
}());
exports.ComplexityAnalyzer = ComplexityAnalyzer;
var MetricsCalculator = /** @class */ (function () {
    function MetricsCalculator() {
    }
    MetricsCalculator.prototype.calculateCyclomaticComplexity = function (node) {
        var complexity = 1;
        var visit = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.IfStatement:
                case ts.SyntaxKind.ConditionalExpression:
                case ts.SyntaxKind.WhileStatement:
                case ts.SyntaxKind.DoStatement:
                case ts.SyntaxKind.ForStatement:
                case ts.SyntaxKind.ForInStatement:
                case ts.SyntaxKind.ForOfStatement:
                case ts.SyntaxKind.CaseClause:
                case ts.SyntaxKind.CatchClause:
                case ts.SyntaxKind.BinaryExpression:
                    if (node.kind === ts.SyntaxKind.BinaryExpression) {
                        var binExpr = node;
                        if (binExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                            binExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
                            complexity++;
                        }
                    }
                    else {
                        complexity++;
                    }
            }
            ts.forEachChild(node, visit);
        };
        visit(node);
        return complexity;
    };
    MetricsCalculator.prototype.calculateMaintainabilityIndex = function (code) {
        var halsteadVolume = this.calculateHalsteadVolume(code);
        var cyclomaticComplexity = this.calculateCyclomaticComplexity(ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true));
        var linesOfCode = code.split('\n').length;
        var mi = Math.max(0, (171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)) * 100 / 171);
        return Math.min(100, mi);
    };
    MetricsCalculator.prototype.calculateCognitiveComplexity = function (node) {
        var complexity = 0;
        var nestingLevel = 0;
        var visit = function (node) {
            var increment = function () {
                complexity += (1 + nestingLevel);
            };
            switch (node.kind) {
                case ts.SyntaxKind.IfStatement:
                case ts.SyntaxKind.WhileStatement:
                case ts.SyntaxKind.DoStatement:
                case ts.SyntaxKind.ForStatement:
                case ts.SyntaxKind.ForInStatement:
                case ts.SyntaxKind.ForOfStatement:
                    increment();
                    nestingLevel++;
                    ts.forEachChild(node, visit);
                    nestingLevel--;
                    break;
                case ts.SyntaxKind.CatchClause:
                case ts.SyntaxKind.ConditionalExpression:
                case ts.SyntaxKind.BinaryExpression:
                    if (node.kind === ts.SyntaxKind.BinaryExpression) {
                        var binExpr = node;
                        if (binExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                            binExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
                            increment();
                        }
                    }
                    else {
                        increment();
                    }
                    ts.forEachChild(node, visit);
                    break;
                default:
                    ts.forEachChild(node, visit);
            }
        };
        visit(node);
        return complexity;
    };
    MetricsCalculator.prototype.calculateHalsteadDifficulty = function (node) {
        var metrics = this.getHalsteadMetrics(node);
        var n1 = metrics.distinctOperators;
        var n2 = metrics.distinctOperands;
        var N2 = metrics.totalOperands;
        if (n2 === 0) {
            return 0;
        }
        return (n1 * N2) / (2 * n2);
    };
    MetricsCalculator.prototype.calculateNestingDepth = function (node) {
        var maxDepth = 0;
        var currentDepth = 0;
        var visit = function (node) {
            switch (node.kind) {
                case ts.SyntaxKind.IfStatement:
                case ts.SyntaxKind.WhileStatement:
                case ts.SyntaxKind.ForStatement:
                case ts.SyntaxKind.ForInStatement:
                case ts.SyntaxKind.ForOfStatement:
                case ts.SyntaxKind.DoStatement:
                case ts.SyntaxKind.Block:
                    currentDepth++;
                    maxDepth = Math.max(maxDepth, currentDepth);
                    ts.forEachChild(node, visit);
                    currentDepth--;
                    break;
                default:
                    ts.forEachChild(node, visit);
            }
        };
        visit(node);
        return maxDepth;
    };
    MetricsCalculator.prototype.calculateHalsteadVolume = function (code) {
        var metrics = this.getHalsteadMetrics(ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true));
        var vocabulary = metrics.distinctOperators + metrics.distinctOperands;
        var length = metrics.totalOperators + metrics.totalOperands;
        if (vocabulary === 0) {
            return 0;
        }
        return length * Math.log2(vocabulary);
    };
    MetricsCalculator.prototype.getHalsteadMetrics = function (node) {
        var operators = new Set();
        var operands = new Set();
        var totalOperators = 0;
        var totalOperands = 0;
        var visit = function (node) {
            if (ts.isBinaryExpression(node)) {
                operators.add(node.operatorToken.getText());
                totalOperators++;
            }
            else if (ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
                operators.add(node.operator.toString());
                totalOperators++;
            }
            else if (ts.isIdentifier(node)) {
                operands.add(node.text);
                totalOperands++;
            }
            else if (ts.isLiteralExpression(node)) {
                operands.add(node.getText());
                totalOperands++;
            }
            ts.forEachChild(node, visit);
        };
        visit(node);
        return {
            distinctOperators: operators.size,
            distinctOperands: operands.size,
            totalOperators: totalOperators,
            totalOperands: totalOperands
        };
    };
    return MetricsCalculator;
}());
exports.MetricsCalculator = MetricsCalculator;
var DependencyAnalyzer = /** @class */ (function () {
    function DependencyAnalyzer() {
    }
    DependencyAnalyzer.prototype.analyzeDependencies = function (node) {
        var _this = this;
        var dependencies = new Set();
        var visit = function (node) {
            if (ts.isIdentifier(node) && !_this.isParameter(node, node.parent)) {
                dependencies.add(node.text);
            }
            ts.forEachChild(node, visit);
        };
        ts.forEachChild(node, visit);
        return Array.from(dependencies);
    };
    DependencyAnalyzer.prototype.getParameters = function (node) {
        return node.parameters.map(function (param) { return param.name.getText(); });
    };
    DependencyAnalyzer.prototype.getReturnType = function (node) {
        return node.type ? node.type.getText() : 'any';
    };
    DependencyAnalyzer.prototype.isParameter = function (node, parent) {
        if (!parent) {
            return false;
        }
        return ts.isParameter(parent) && parent.name === node;
    };
    return DependencyAnalyzer;
}());
exports.DependencyAnalyzer = DependencyAnalyzer;
