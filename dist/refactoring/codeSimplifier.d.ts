/**
 * Provides functionality for simplifying code using LLM-based analysis
 */
export declare class CodeSimplifier {
    private llmProvider?;
    constructor();
    /**
     * Simplifies the provided code using LLM analysis
     * @param code The code to simplify
     * @param language The programming language of the code
     * @returns Simplified code or null if simplification failed
     */
    simplifyCode(code: string, language: string): Promise<string | null>;
    /**
     * Simplifies the code in the active editor
     */
    simplifyActiveEditorCode(): Promise<void>;
    /**
     * Builds the prompt for code simplification
     */
    private buildSimplificationPrompt;
    /**
     * Extracts the simplified code from the LLM response
     */
    private extractSimplifiedCode;
}
