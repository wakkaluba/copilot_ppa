import * as vscode from 'vscode';
import * as ts from 'typescript';

export interface ComplexityMetrics {
    cyclomaticComplexity: number;
    maintainabilityIndex: number;
    cognitiveComplexity: number;
    halsteadDifficulty: number;
    lineCount: number;
    nestingDepth: number;
}

export interface FunctionAnalysis extends ComplexityMetrics {
    name: string;
    parameters: string[];
    returnType: string;
    dependencies: string[];
}

export interface IComplexityService {
    analyzeCode(document: vscode.TextDocument): Promise<ComplexityMetrics>;
    analyzeFunction(document: vscode.TextDocument, functionName: string): Promise<FunctionAnalysis | null>;
    analyzeMetrics(code: string): ComplexityMetrics;
    getComplexityGrade(complexity: number): 'Low' | 'Medium' | 'High';
}

export interface IMetricsCalculator {
    calculateCyclomaticComplexity(node: ts.Node): number;
    calculateMaintainabilityIndex(code: string): number;
    calculateCognitiveComplexity(node: ts.Node): number;
    calculateHalsteadDifficulty(node: ts.Node): number;
    calculateNestingDepth(node: ts.Node): number;
}

export class ComplexityAnalyzer implements IComplexityService {
    private readonly COMPLEXITY_THRESHOLD = {
        LOW: 10,
        MEDIUM: 20,
        HIGH: 30
    };

    private readonly metricsCalculator: MetricsCalculator;
    private readonly dependencyAnalyzer: DependencyAnalyzer;

    constructor() {
        this.metricsCalculator = new MetricsCalculator();
        this.dependencyAnalyzer = new DependencyAnalyzer();
    }

    public async analyzeCode(document: vscode.TextDocument): Promise<ComplexityMetrics> {
        const sourceFile = ts.createSourceFile(
            document.fileName,
            document.getText(),
            ts.ScriptTarget.Latest,
            true
        );

        const metrics = this.analyzeNode(sourceFile);
        return {
            ...metrics,
            maintainabilityIndex: this.metricsCalculator.calculateMaintainabilityIndex(document.getText()),
            lineCount: document.lineCount
        };
    }

    public async analyzeFunction(document: vscode.TextDocument, functionName: string): Promise<FunctionAnalysis | null> {
        const sourceFile = ts.createSourceFile(
            document.fileName,
            document.getText(),
            ts.ScriptTarget.Latest,
            true
        );

        const functionNode = this.findFunctionNode(sourceFile, functionName);
        if (!functionNode) {return null;}

        const metrics = this.analyzeNode(functionNode);
        const dependencies = this.dependencyAnalyzer.analyzeDependencies(functionNode);
        
        return {
            ...metrics,
            name: functionName,
            parameters: this.dependencyAnalyzer.getParameters(functionNode),
            returnType: this.dependencyAnalyzer.getReturnType(functionNode),
            dependencies
        };
    }

    public analyzeMetrics(code: string): ComplexityMetrics {
        const sourceFile = ts.createSourceFile(
            'temp.ts',
            code,
            ts.ScriptTarget.Latest,
            true
        );

        return this.analyzeNode(sourceFile);
    }

    public getComplexityGrade(complexity: number): 'Low' | 'Medium' | 'High' {
        if (complexity <= this.COMPLEXITY_THRESHOLD.LOW) {return 'Low';}
        if (complexity <= this.COMPLEXITY_THRESHOLD.MEDIUM) {return 'Medium';}
        return 'High';
    }

    private analyzeNode(node: ts.Node): ComplexityMetrics {
        return {
            cyclomaticComplexity: this.metricsCalculator.calculateCyclomaticComplexity(node),
            maintainabilityIndex: this.metricsCalculator.calculateMaintainabilityIndex(node.getText()),
            cognitiveComplexity: this.metricsCalculator.calculateCognitiveComplexity(node),
            halsteadDifficulty: this.metricsCalculator.calculateHalsteadDifficulty(node),
            lineCount: node.getFullText().split('\n').length,
            nestingDepth: this.metricsCalculator.calculateNestingDepth(node)
        };
    }

    private findFunctionNode(sourceFile: ts.SourceFile, functionName: string): ts.FunctionDeclaration | null {
        let functionNode: ts.FunctionDeclaration | null = null;
        
        const visit = (node: ts.Node) => {
            if (ts.isFunctionDeclaration(node) && node.name?.text === functionName) {
                functionNode = node;
                return;
            }
            ts.forEachChild(node, visit);
        };

        ts.forEachChild(sourceFile, visit);
        return functionNode;
    }
}

export class MetricsCalculator implements IMetricsCalculator {
    public calculateCyclomaticComplexity(node: ts.Node): number {
        let complexity = 1;
        
        const visit = (node: ts.Node) => {
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
                        const binExpr = node as ts.BinaryExpression;
                        if (binExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                            binExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
                            complexity++;
                        }
                    } else {
                        complexity++;
                    }
            }
            ts.forEachChild(node, visit);
        };

        visit(node);
        return complexity;
    }

    public calculateMaintainabilityIndex(code: string): number {
        const halsteadVolume = this.calculateHalsteadVolume(code);
        const cyclomaticComplexity = this.calculateCyclomaticComplexity(
            ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true)
        );
        const linesOfCode = code.split('\n').length;

        const mi = Math.max(0, (171 - 5.2 * Math.log(halsteadVolume) - 0.23 * cyclomaticComplexity - 16.2 * Math.log(linesOfCode)) * 100 / 171);
        return Math.min(100, mi);
    }

    public calculateCognitiveComplexity(node: ts.Node): number {
        let complexity = 0;
        let nestingLevel = 0;

        const visit = (node: ts.Node) => {
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
                        const binExpr = node as ts.BinaryExpression;
                        if (binExpr.operatorToken.kind === ts.SyntaxKind.AmpersandAmpersandToken ||
                            binExpr.operatorToken.kind === ts.SyntaxKind.BarBarToken) {
                            increment();
                        }
                    } else {
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

    public calculateHalsteadDifficulty(node: ts.Node): number {
        const metrics = this.getHalsteadMetrics(node);
        const n1 = metrics.distinctOperators;
        const n2 = metrics.distinctOperands;
        const N2 = metrics.totalOperands;

        if (n2 === 0) {return 0;}
        return (n1 * N2) / (2 * n2);
    }

    public calculateNestingDepth(node: ts.Node): number {
        let maxDepth = 0;
        let currentDepth = 0;

        const visit = (node: ts.Node) => {
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

    private calculateHalsteadVolume(code: string): number {
        const metrics = this.getHalsteadMetrics(
            ts.createSourceFile('temp.ts', code, ts.ScriptTarget.Latest, true)
        );
        const vocabulary = metrics.distinctOperators + metrics.distinctOperands;
        const length = metrics.totalOperators + metrics.totalOperands;

        if (vocabulary === 0) {return 0;}
        return length * Math.log2(vocabulary);
    }

    private getHalsteadMetrics(node: ts.Node) {
        const operators = new Set<string>();
        const operands = new Set<string>();
        let totalOperators = 0;
        let totalOperands = 0;

        const visit = (node: ts.Node) => {
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
            totalOperators,
            totalOperands
        };
    }
}

export class DependencyAnalyzer {
    public analyzeDependencies(node: ts.FunctionDeclaration): string[] {
        const dependencies = new Set<string>();
        
        const visit = (node: ts.Node) => {
            if (ts.isIdentifier(node) && !this.isParameter(node, node.parent)) {
                dependencies.add(node.text);
            }
            ts.forEachChild(node, visit);
        };

        ts.forEachChild(node, visit);
        return Array.from(dependencies);
    }

    public getParameters(node: ts.FunctionDeclaration): string[] {
        return node.parameters.map(param => param.name.getText());
    }

    public getReturnType(node: ts.FunctionDeclaration): string {
        return node.type ? node.type.getText() : 'any';
    }

    private isParameter(node: ts.Node, parent: ts.Node | undefined): boolean {
        if (!parent) {return false;}
        return ts.isParameter(parent) && parent.name === node;
    }
}