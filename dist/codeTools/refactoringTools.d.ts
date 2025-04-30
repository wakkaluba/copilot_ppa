import { EventEmitter } from '../common/eventEmitter';
/**
 * Provides refactoring tools for code improvements
 */
export declare class RefactoringTools extends EventEmitter {
    private simplificationService;
    private unusedCodeAnalyzer;
    private diffService;
    private outputService;
    private llmService;
    constructor();
    /**
     * Initialize the refactoring tools
     */
    initialize(): Promise<void>;
    /**
     * Simplify code in the current editor
     */
    simplifyCode(): Promise<void>;
    /**
     * Remove unused code (dead code) in the current editor
     */
    removeUnusedCode(): Promise<void>;
    /**
     * Refactor code using LLM in the current editor
     * @param instructions Instructions for the refactoring
     */
    refactorWithLLM(instructions: string): Promise<void>;
    /**
     * Show diff and apply changes if user confirms
     * @param uri Document URI
     * @param originalCode Original code
     * @param newCode New code
     * @param title Diff title
     * @param prompt Confirmation prompt
     */
    private showAndApplyChanges;
    /**
     * Dispose resources
     */
    dispose(): void;
}
