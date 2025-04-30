export interface DependencyNode {
    id: string;
    name: string;
    path: string;
    type: 'file' | 'package' | 'external';
    size?: number;
}
export interface DependencyLink {
    source: string;
    target: string;
    type: 'import' | 'require' | 'dependency';
    strength?: number;
}
export interface DependencyGraph {
    nodes: DependencyNode[];
    links: DependencyLink[];
}
export interface DependencyInfo {
    name: string;
    version: string;
    isDev: boolean;
    isOptional?: boolean;
    isPeer?: boolean;
}
export interface DependencyAnalysisResult {
    filePath: string;
    graph: DependencyGraph;
}
export declare class DependencyAnalyzer {
    /**
     * Analyzes dependencies in a JavaScript/TypeScript project
     * @param projectPath Path to the project root
     * @returns Promise with the dependency analysis result
     */
    analyzeDependencies(projectPath: string): Promise<DependencyAnalysisResult>;
    /**
     * Analyzes imports in a JavaScript/TypeScript file
     * @param filePath Path to the file
     * @returns Promise with the dependency analysis result
     */
    analyzeFileImports(filePath: string): Promise<DependencyAnalysisResult>;
    private buildDependencyGraph;
    private buildFileImportGraph;
    private addImportToGraph;
}
