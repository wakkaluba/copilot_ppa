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
exports.CodeComplexityAnalyzer = void 0;
const vscode = __importStar(require("vscode"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const parser_1 = require("@babel/parser");
const traverse_1 = __importDefault(require("@babel/traverse"));
const t = __importStar(require("@babel/types"));
class CodeComplexityAnalyzer {
    /**
     * Analyzes complexity for a single file
     * @param filePath Path to the file to analyze
     * @returns Complexity analysis result
     */
    async analyzeFile(filePath) {
        try {
            const content = await fs.promises.readFile(filePath, 'utf-8');
            const extension = path.extname(filePath).toLowerCase();
            if (!['.js', '.jsx', '.ts', '.tsx'].includes(extension)) {
                return null; // Only analyze JavaScript/TypeScript files
            }
            const ast = (0, parser_1.parse)(content, {
                sourceType: 'module',
                plugins: [
                    'jsx',
                    'typescript',
                    'classProperties',
                    'decorators-legacy',
                ],
                locations: true,
            });
            const functions = [];
            (0, traverse_1.default)(ast, {
                'FunctionDeclaration|FunctionExpression|ArrowFunctionExpression': (path) => {
                    const name = this.getFunctionName(path);
                    const complexity = this.calculateCyclomaticComplexity(path);
                    if (path.node.loc) {
                        functions.push({
                            name,
                            complexity,
                            startLine: path.node.loc.start.line,
                            endLine: path.node.loc.end.line,
                            startColumn: path.node.loc.start.column,
                            endColumn: path.node.loc.end.column,
                        });
                    }
                }
            });
            const totalComplexity = functions.reduce((sum, fn) => sum + fn.complexity, 0);
            const averageComplexity = functions.length > 0 ? totalComplexity / functions.length : 0;
            return {
                filePath,
                fileName: path.basename(filePath),
                totalComplexity,
                functions,
                averageComplexity
            };
        }
        catch (error) {
            console.error(`Error analyzing file ${filePath}:`, error);
            return null;
        }
    }
    /**
     * Analyzes complexity for all files in a workspace
     * @param workspaceFolder Workspace folder to analyze
     * @returns Complexity analysis results for all files
     */
    async analyzeWorkspace(workspaceFolder) {
        const results = [];
        const files = await vscode.workspace.findFiles(new vscode.RelativePattern(workspaceFolder, '**/*.{js,jsx,ts,tsx}'), new vscode.RelativePattern(workspaceFolder, '**/node_modules/**'));
        for (const file of files) {
            const result = await this.analyzeFile(file.fsPath);
            if (result) {
                results.push(result);
            }
        }
        return results;
    }
    /**
     * Generates a detailed complexity report as markdown
     * @param results Complexity analysis results
     * @returns Markdown formatted report
     */
    generateComplexityReport(results) {
        let report = '# Code Complexity Analysis Report\n\n';
        // Summary section
        report += '## Summary\n\n';
        const totalFiles = results.length;
        const totalComplexity = results.reduce((sum, result) => sum + result.totalComplexity, 0);
        const totalFunctions = results.reduce((sum, result) => sum + result.functions.length, 0);
        const averageFileComplexity = totalFiles > 0 ? totalComplexity / totalFiles : 0;
        const averageFunctionComplexity = totalFunctions > 0 ?
            results.reduce((sum, result) => sum + result.functions.reduce((fSum, fn) => fSum + fn.complexity, 0), 0) / totalFunctions : 0;
        report += `- **Files analyzed**: ${totalFiles}\n`;
        report += `- **Total functions**: ${totalFunctions}\n`;
        report += `- **Average file complexity**: ${averageFileComplexity.toFixed(2)}\n`;
        report += `- **Average function complexity**: ${averageFunctionComplexity.toFixed(2)}\n\n`;
        // Files with high complexity
        const highComplexityFiles = results
            .filter(r => r.averageComplexity > this.HIGH_COMPLEXITY_THRESHOLD)
            .sort((a, b) => b.averageComplexity - a.averageComplexity);
        report += '## Files with High Complexity\n\n';
        if (highComplexityFiles.length === 0) {
            report += '*No files with high complexity found.*\n\n';
        }
        else {
            report += '| File | Average Complexity | Total Functions |\n';
            report += '|------|-------------------|----------------|\n';
            highComplexityFiles.forEach(file => {
                report += `| ${file.fileName} | ${file.averageComplexity.toFixed(2)} | ${file.functions.length} |\n`;
            });
            report += '\n';
        }
        // Complex functions
        const complexFunctions = results
            .flatMap(r => r.functions.map(fn => ({ ...fn, fileName: r.fileName, filePath: r.filePath })))
            .filter(fn => fn.complexity > this.HIGH_COMPLEXITY_THRESHOLD)
            .sort((a, b) => b.complexity - a.complexity)
            .slice(0, 20); // Show top 20
        report += '## Most Complex Functions\n\n';
        if (complexFunctions.length === 0) {
            report += '*No highly complex functions found.*\n\n';
        }
        else {
            report += '| Function | File | Complexity | Line |\n';
            report += '|----------|------|------------|------|\n';
            complexFunctions.forEach(fn => {
                report += `| ${fn.name} | ${fn.fileName} | ${fn.complexity} | ${fn.startLine} |\n`;
            });
            report += '\n';
        }
        report += '## Detailed File Analysis\n\n';
        results
            .sort((a, b) => b.averageComplexity - a.averageComplexity)
            .forEach(file => {
            report += `### ${file.fileName}\n\n`;
            report += `- **Average complexity**: ${file.averageComplexity.toFixed(2)}\n`;
            report += `- **Total complexity**: ${file.totalComplexity}\n`;
            report += `- **Functions**: ${file.functions.length}\n\n`;
            if (file.functions.length > 0) {
                report += '| Function | Complexity | Line range |\n';
                report += '|----------|------------|------------|\n';
                file.functions
                    .sort((a, b) => b.complexity - a.complexity)
                    .forEach(fn => {
                    const complexityEmoji = fn.complexity > this.HIGH_COMPLEXITY_THRESHOLD ? '🔴' :
                        fn.complexity > this.MEDIUM_COMPLEXITY_THRESHOLD ? '🟠' : '🟢';
                    report += `| ${fn.name} | ${complexityEmoji} ${fn.complexity} | ${fn.startLine}-${fn.endLine} |\n`;
                });
                report += '\n';
            }
        });
        return report;
    }
    /**
     * Visualizes complexity in the editor using decorations
     * @param editor Active text editor
     * @param result Complexity analysis result for the current file
     */
    visualizeComplexity(editor, result) {
        const disposables = [];
        const highComplexityDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 0, 0, 0.1)',
            isWholeLine: true,
            overviewRulerColor: 'rgba(255, 0, 0, 0.7)',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });
        const mediumComplexityDecorationType = vscode.window.createTextEditorDecorationType({
            backgroundColor: 'rgba(255, 165, 0, 0.1)',
            isWholeLine: true,
            overviewRulerColor: 'rgba(255, 165, 0, 0.7)',
            overviewRulerLane: vscode.OverviewRulerLane.Right,
        });
        const highComplexityDecorations = [];
        const mediumComplexityDecorations = [];
        result.functions.forEach(fn => {
            const startPos = new vscode.Position(fn.startLine - 1, fn.startColumn);
            const endPos = new vscode.Position(fn.endLine - 1, fn.endColumn);
            const range = new vscode.Range(startPos, endPos);
            const decoration = {
                range,
                hoverMessage: `**Cyclomatic Complexity: ${fn.complexity}**\n\nFunction: ${fn.name}\nLines: ${fn.startLine}-${fn.endLine}`
            };
            if (fn.complexity > this.HIGH_COMPLEXITY_THRESHOLD) {
                highComplexityDecorations.push(decoration);
            }
            else if (fn.complexity > this.MEDIUM_COMPLEXITY_THRESHOLD) {
                mediumComplexityDecorations.push(decoration);
            }
        });
        editor.setDecorations(highComplexityDecorationType, highComplexityDecorations);
        editor.setDecorations(mediumComplexityDecorationType, mediumComplexityDecorations);
        disposables.push(highComplexityDecorationType);
        disposables.push(mediumComplexityDecorationType);
        return disposables;
    }
    /**
     * Calculate cyclomatic complexity for a function
     * @param path AST path for the function
     * @returns Cyclomatic complexity score
     */
    calculateCyclomaticComplexity(path) {
        let complexity = 1; // Base complexity is 1
        (0, traverse_1.default)(path.node, {
            IfStatement() { complexity++; },
            SwitchCase() { complexity++; },
            ConditionalExpression() { complexity++; },
            LogicalExpression(path) {
                if (path.node.operator === '&&' || path.node.operator === '||') {
                    complexity++;
                }
            },
            ForStatement() { complexity++; },
            ForInStatement() { complexity++; },
            ForOfStatement() { complexity++; },
            WhileStatement() { complexity++; },
            DoWhileStatement() { complexity++; },
            CatchClause() { complexity++; },
        }, path.scope);
        return complexity;
    }
    /**
     * Get function name from AST node
     * @param path AST path for the function
     * @returns Name of the function or anonymous indicator
     */
    getFunctionName(path) {
        const node = path.node;
        if (t.isFunctionDeclaration(node) && node.id) {
            return node.id.name;
        }
        if (t.isFunctionExpression(node) && node.id) {
            return node.id.name;
        }
        // Try to find variable name for assignment
        if (path.parent && t.isVariableDeclarator(path.parent) && t.isIdentifier(path.parent.id)) {
            return path.parent.id.name;
        }
        // Try to find object method name
        if (path.parent && t.isObjectProperty(path.parent) && t.isIdentifier(path.parent.key)) {
            return path.parent.key.name;
        }
        // Try to find class method name
        if (path.parent && t.isClassMethod(path.parent) && t.isIdentifier(path.parent.key)) {
            return path.parent.key.name;
        }
        return '<anonymous>';
    }
}
exports.CodeComplexityAnalyzer = CodeComplexityAnalyzer;
CodeComplexityAnalyzer.HIGH_COMPLEXITY_THRESHOLD = 15;
CodeComplexityAnalyzer.MEDIUM_COMPLEXITY_THRESHOLD = 10;
//# sourceMappingURL=codeComplexityAnalyzer.js.map