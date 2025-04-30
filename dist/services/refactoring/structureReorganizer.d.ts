export interface StructureSuggestion {
    type: 'split_file' | 'reduce_nesting' | 'split_function' | 'move_method' | 'extract_interface';
    description: string;
    severity: 'suggestion' | 'recommendation' | 'warning';
    location?: {
        start: number;
        end: number;
    };
}
export interface StructureAnalysisResult {
    suggestions: StructureSuggestion[];
    summary: string;
    metrics?: {
        complexity: number;
        maintainability: number;
        coupling: number;
    };
}
export interface ReorganizationProposal {
    originalCode: string;
    reorganizedCode: string;
    changes: Array<{
        type: string;
        description: string;
        location: {
            start: number;
            end: number;
        };
    }>;
}
/**
 * Service responsible for analyzing and reorganizing code structure
 */
export declare class StructureReorganizer {
    private readonly supportedLanguages;
    /**
     * Analyzes the structure of a file and suggests improvements
     * @param filePath Path to the file to analyze
     * @returns Analysis result with suggestions
     */
    analyzeFileStructure(filePath: string): Promise<StructureAnalysisResult>;
    /**
     * Proposes reorganization for the given code
     */
    proposeReorganization(filePath: string): Promise<ReorganizationProposal>;
    private analyzeByLanguage;
    private analyzeJavaScriptStructure;
    private analyzePythonStructure;
    private analyzeJavaStructure;
    private calculateComplexity;
    private calculateMaintainability;
    private calculateCoupling;
    private detectMaxIndentation;
    private detectLargeFunctions;
    private generateReorganizedCode;
}
