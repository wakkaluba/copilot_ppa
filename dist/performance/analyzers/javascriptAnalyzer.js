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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JavaScriptAnalyzer = void 0;
const baseAnalyzer_1 = require("./baseAnalyzer");
const parser = __importStar(require("@babel/parser"));
const traverse_1 = __importDefault(require("@babel/traverse"));
class JavaScriptAnalyzer extends baseAnalyzer_1.BasePerformanceAnalyzer {
    thresholds = {
        cyclomaticComplexity: [10, 20],
        nestedBlockDepth: [3, 5],
        functionLength: [100, 200],
        parameterCount: [4, 7],
        maintainabilityIndex: [65, 85],
        commentRatio: [10, 20]
    };
    constructor(options) {
        super(options);
    }
    analyze(fileContent, filePath) {
        if (!this.shouldAnalyzeFile(filePath)) {
            return this.createBaseResult(fileContent, filePath);
        }
        const result = this.createBaseResult(fileContent, filePath);
        try {
            const ast = this.parseCode(fileContent, filePath);
            this.analyzeAst(ast, fileContent, result);
        }
        catch (error) {
            result.issues.push({
                severity: 'high',
                title: 'Parse Error',
                description: `Failed to parse file: ${error.message}`,
                line: 1,
                column: 1
            });
        }
        return result;
    }
    parseCode(content, filePath) {
        const isTypeScript = filePath.endsWith('.ts') || filePath.endsWith('.tsx');
        return parser.parse(content, {
            sourceType: 'module',
            plugins: [
                'jsx',
                isTypeScript ? 'typescript' : 'flow',
                'decorators-legacy',
                'classProperties'
            ]
        });
    }
    analyzeAst(ast, content, result) {
        let complexity = 0;
        let maxDepth = 0;
        let currentDepth = 0;
        (0, traverse_1.default)(ast, {
            enter: (path) => {
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
                        if (path.node.test)
                            complexity++;
                        break;
                    case 'LogicalExpression':
                        if (path.node.operator === '&&' || path.node.operator === '||') {
                            complexity++;
                        }
                        break;
                }
                // Function-specific analysis
                if (path.isFunctionDeclaration() || path.isFunctionExpression() || path.isArrowFunctionExpression()) {
                    this.analyzeFunctionComplexity(path.node, content, result);
                }
                // Class analysis
                if (path.isClassDeclaration() || path.isClassExpression()) {
                    this.analyzeClassComplexity(path.node, content, result);
                }
            },
            exit: () => {
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
                description: `File has a cyclomatic complexity of ${complexity}, which exceeds the threshold of ${this.options.thresholds.cyclomaticComplexity[1]}`,
                line: 1
            });
        }
    }
    analyzeFunctionComplexity(node, content, result) {
        // Calculate function length
        const start = this.findLineNumber(content, node.start);
        const end = this.findLineNumber(content, node.end);
        const length = end - start + 1;
        if (length > this.options.thresholds.functionLength[1]) {
            result.issues.push({
                severity: 'medium',
                title: 'Long Function',
                description: `Function is ${length} lines long, which exceeds the recommended maximum of ${this.options.thresholds.functionLength[1]} lines`,
                line: start + 1
            });
        }
        // Check parameter count
        const params = 'params' in node ? node.params.length : 0;
        if (params > this.options.thresholds.parameterCount[1]) {
            result.issues.push({
                severity: 'medium',
                title: 'Too Many Parameters',
                description: `Function has ${params} parameters, which exceeds the recommended maximum of ${this.options.thresholds.parameterCount[1]}`,
                line: start + 1
            });
        }
    }
    analyzeClassComplexity(node, content, result) {
        if ('body' in node && 'body' in node.body) {
            const methods = node.body.body.filter(member => member.type === 'ClassMethod' ||
                member.type === 'ClassPrivateMethod');
            if (methods.length > 20) {
                const start = this.findLineNumber(content, node.start);
                result.issues.push({
                    severity: 'medium',
                    title: 'Large Class',
                    description: `Class has ${methods.length} methods, consider breaking it down into smaller classes`,
                    line: start + 1
                });
            }
        }
    }
    getCodeContext(content, position) {
        const lines = content.split('\n');
        const lineIndex = content.substring(0, position).split('\n').length - 1;
        return this.extractCodeSnippet(lines, lineIndex);
    }
    createIssue(title, description, severity, line, code, solution, solutionCode) {
        return {
            title,
            description,
            severity,
            line,
            code,
            solution,
            solutionCode
        };
    }
    findLineNumber(content, position) {
        return content.substring(0, position).split('\n').length;
    }
    calculateConditionalComplexity(content) {
        const conditions = content.match(/if\s*\(|else\s+if\s*\(|\?\s*[^:]+\s*:/g) || [];
        const switches = content.match(/switch\s*\([^{]+\)\s*{[^}]+}/g) || [];
        const ternaries = content.match(/\?[^:]+:/g) || [];
        return conditions.length + switches.length + ternaries;
    }
}
exports.JavaScriptAnalyzer = JavaScriptAnalyzer;
//# sourceMappingURL=javascriptAnalyzer.js.map