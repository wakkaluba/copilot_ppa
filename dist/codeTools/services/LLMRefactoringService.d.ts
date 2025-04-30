/**
 * Service to leverage LLM capabilities for code refactoring
 */
export declare class LLMRefactoringService {
    /**
     * Initialize the service
     */
    initialize(): Promise<void>;
    /**
     * Refactor code using LLM
     * @param code Code to refactor
     * @param language Language of the code
     * @param instructions Refactoring instructions
     * @returns Refactored code
     */
    refactorCode(code: string, language: string, instructions: string): Promise<string>;
}
