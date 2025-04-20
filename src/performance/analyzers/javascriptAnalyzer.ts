import * as vscode from 'vscode';
import { BasePerformanceAnalyzer } from './baseAnalyzer';
import { extractFunctionBody } from '../utils';
import {
    PerformanceAnalysisResult,
    PerformanceIssue,
    AnalyzerOptions,
    LanguageMetricThresholds
} from '../types';
import * as parser from '@babel/parser';
import traverse from '@babel/traverse';
import type { Node, File } from '@babel/types';

export class JavaScriptAnalyzer extends BasePerformanceAnalyzer {
    protected override thresholds: LanguageMetricThresholds = {
        cyclomaticComplexity: [10, 20],
        nestedBlockDepth: [3, 5],
        functionLength: [100, 200],
        parameterCount: [4, 7],
        maintainabilityIndex: [65, 85],
        commentRatio: [10, 20]
    };

    constructor(options?: AnalyzerOptions) {
        super(options);
    }

    public override analyze(fileContent: string, filePath: string): PerformanceAnalysisResult {
        if (!this.shouldAnalyzeFile(filePath)) {
            return this.createBaseResult(fileContent, filePath);
        }

        const result = this.createBaseResult(fileContent, filePath);
        
        try {
            const ast = this.parseCode(fileContent, filePath);
            this.analyzeAst(ast, fileContent, result);
        } catch (error) {
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

    private parseCode(content: string, filePath: string): File {
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

    private analyzeAst(ast: File, content: string, result: PerformanceAnalysisResult): void {
        let complexity = 0;
        let maxDepth = 0;
        let currentDepth = 0;

        traverse(ast, {
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
                        if (path.node.test) complexity++;
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

    private analyzeFunctionComplexity(node: Node, content: string, result: PerformanceAnalysisResult): void {
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

    private analyzeClassComplexity(node: Node, content: string, result: PerformanceAnalysisResult): void {
        if ('body' in node && 'body' in node.body) {
            const methods = node.body.body.filter(member => 
                member.type === 'ClassMethod' || 
                member.type === 'ClassPrivateMethod'
            );

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

    protected getCodeContext(content: string, position: number): string {
        const lines = content.split('\n');
        const lineIndex = content.substring(0, position).split('\n').length - 1;
        return this.extractCodeSnippet(lines, lineIndex);
    }

    protected createIssue(
        title: string,
        description: string,
        severity: PerformanceIssue['severity'],
        line: number,
        code: string,
        solution: string,
        solutionCode?: string
    ): PerformanceIssue {
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

    private findLineNumber(content: string, position: number): number {
        return content.substring(0, position).split('\n').length;
    }

    private calculateConditionalComplexity(content: string): number {
        const conditions = content.match(/if\s*\(|else\s+if\s*\(|\?\s*[^:]+\s*:/g) || [];
        const switches = content.match(/switch\s*\([^{]+\)\s*{[^}]+}/g) || [];
        const ternaries = content.match(/\?[^:]+:/g) || [];

        return conditions.length + switches.length + ternaries;
    }
}