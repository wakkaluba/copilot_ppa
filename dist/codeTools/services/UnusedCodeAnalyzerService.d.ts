/**
 * Service to analyze and remove unused code
 */
export declare class UnusedCodeAnalyzerService {
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Analyze and remove unused code
     * @param text Code to analyze
     * @param languageId Language identifier
     * @returns Code with unused elements removed
     */
    removeUnusedCode(text: string, languageId: string): Promise<string>;
}
