"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.ComplexityAnalyzer = void 0;
const ts = __importStar(require("typescript"));
class ComplexityAnalyzer {
    constructor() {
        this.COMPLEXITY_THRESHOLD = {
            LOW: 10,
            MEDIUM: 20,
            HIGH: 30
        };
        this.initialize();
    }
    initialize() {
        // Initialize any required resources
    }
    analyzeCode(document) {
        const sourceFile = ts.createSourceFile(document.fileName, document.getText(), ts.ScriptTarget.Latest, true);
        const metrics = this.analyzeNode(sourceFile);
        return {
            ...metrics,
            maintainabilityIndex: this.calculateMaintainabilityIndex(document.getText()),
            lineCount: document.lineCount
        };
    }
    analyzeFunction(document, functionName) {
        const sourceFile = ts.createSourceFile(document.fileName, document.getText(), ts.ScriptTarget.Latest, true);
        let functionNode = null;
        const visit = (node) => {
            if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
                functionNode = node;
            }
            ts.forEachChild(node, visit);
        };
        ts.forEachChild(sourceFile, visit);
        if (!functionNode)
            return null;
        const metrics = this.analyzeNode(functionNode);
        const dependencies = this.analyzeDependencies(functionNode);
        return {
            ...metrics,
            name: functionName,
            parameters: this.getParameters(functionNode),
            returnType: this.getReturnType(functionNode),
            dependencies
        };
    }
    analyzeMetrics(code) {
        const sourceFile = ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true);
        return this.analyzeNode(sourceFile);
    }
    analyzeNode(node) {
        return {
            cyclomaticComplexity: this.calculateCyclomaticComplexity(node),
            maintainabilityIndex: this.calculateMaintainabilityIndex(node.getText()),
            cognitiveComplexity: this.calculateCognitiveComplexity(node),
            halsteadDifficulty: this.calculateHalsteadDifficulty(node),
            lineCount: node.getFullText().split('\n').length,
            nestingDepth: this.calculateNestingDepth(node)
        };
    }
    calculateCyclomaticComplexity(node) {
        let complexity = 1;
        const visit = (node) => {
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
                        const binExpr = node;
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
    }
    calculateMaintainabilityIndex(code) {
        const halsteadVolume = this.calculateHalsteadVolume(code);
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true));
        const linesOfCode = code.split('\n').length;
        const mi = Math.max(0, (171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)) * 100 / 171);
        return Math.min(100, mi);
    }
    calculateNestingDepth(node) {
        let maxDepth = 0;
        let currentDepth = 0;
        const visit = (node) => {
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
    }
    calculateCognitiveComplexity(node) {
        let complexity = 0;
        let nestingLevel = 0;
        const visit = (node) => {
            const increment = () => {
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
                        const binExpr = node;
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
    }
    calculateHalsteadDifficulty(node) {
        const metrics = this.getHalsteadMetrics(node);
        const n1 = metrics.distinctOperators;
        const n2 = metrics.distinctOperands;
        const N2 = metrics.totalOperands;
        if (n2 === 0)
            return 0;
        return (n1 * N2) / (2 * n2);
    }
    calculateHalsteadVolume(code) {
        const metrics = this.getHalsteadMetrics(ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true));
        const vocabulary = metrics.distinctOperators + metrics.distinctOperands;
        const length = metrics.totalOperators + metrics.totalOperands;
        if (vocabulary === 0)
            return 0;
        return length * Math.log2(vocabulary);
    }
    getHalsteadMetrics(node) {
        const operators = new Set();
        const operands = new Set();
        let totalOperators = 0;
        let totalOperands = 0;
        const visit = (node) => {
            if (ts.isBinaryExpression(node) || ts.isPrefixUnaryExpression(node) || ts.isPostfixUnaryExpression(node)) {
                operators.add(node.operatorToken.getText());
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
            totalOperators,
            totalOperands
        };
    }
    getParameters(node) {
        return node.parameters.map(param => param.name.getText());
    }
    getReturnType(node) {
        return node.type ? node.type.getText() : 'any';
    }
    analyzeDependencies(node) {
        const dependencies = new Set();
        const visit = (node) => {
            if (ts.isIdentifier(node) && !this.isParameter(node, node.parent)) {
                dependencies.add(node.text);
            }
            ts.forEachChild(node, visit);
        };
        ts.forEachChild(node, visit);
        return Array.from(dependencies);
    }
    isParameter(node, parent) {
        return ts.isParameter(parent) && parent.name === node;
    }
    getComplexityGrade(complexity) {
        if (complexity <= this.COMPLEXITY_THRESHOLD.LOW)
            return 'Low';
        if (complexity <= this.COMPLEXITY_THRESHOLD.MEDIUM)
            return 'Medium';
        return 'High';
    }
}
exports.ComplexityAnalyzer = ComplexityAnalyzer;
//# sourceMappingURL=complexityAnalyzer.js.map