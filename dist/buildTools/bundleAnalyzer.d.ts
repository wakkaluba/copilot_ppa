interface FileInfo {
    path: string;
    size: number;
    extension: string;
}
interface AnalysisResult {
    totalSize: number;
    jsSize: number;
    cssSize: number;
    imageSize: number;
    otherSize: number;
    files: FileInfo[];
    recommendations: any[];
}
export declare class BundleAnalyzer {
    /**
     * Analyzes bundle files in a directory
     */
    analyzeDirectory(directoryPath: string): Promise<AnalysisResult>;
    private scanDirectory;
    private generateRecommendations;
    private formatSize;
}
export {};
