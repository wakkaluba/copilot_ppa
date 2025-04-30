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
export declare class ComplexityAnalyzer implements IComplexityService {
    private readonly COMPLEXITY_THRESHOLD;
    private readonly metricsCalculator;
    private readonly dependencyAnalyzer;
    constructor();
    analyzeCode(document: vscode.TextDocument): Promise<ComplexityMetrics>;
    analyzeFunction(document: vscode.TextDocument, functionName: string): Promise<FunctionAnalysis | null>;
    analyzeMetrics(code: string): ComplexityMetrics;
    getComplexityGrade(complexity: number): 'Low' | 'Medium' | 'High';
    private analyzeNode;
    private findFunctionNode;
}
export declare class MetricsCalculator implements IMetricsCalculator {
    calculateCyclomaticComplexity(node: ts.Node): number;
    calculateMaintainabilityIndex(code: string): number;
    calculateCognitiveComplexity(node: ts.Node): number;
    calculateHalsteadDifficulty(node: ts.Node): number;
    calculateNestingDepth(node: ts.Node): number;
    private calculateHalsteadVolume;
    private getHalsteadMetrics;
}
export declare class DependencyAnalyzer {
    analyzeDependencies(node: ts.FunctionDeclaration): string[];
    getParameters(node: ts.FunctionDeclaration): string[];
    getReturnType(node: ts.FunctionDeclaration): string;
    private isParameter;
}
