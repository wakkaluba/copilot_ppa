/**
 * Service to handle output for refactoring operations
 */
export declare class RefactoringOutputService {
    private outputChannel;
    constructor();
    /**
     * Start a new operation with a message
     * @param message Operation message
     */
    startOperation(message: string): void;
    /**
     * Log a success message
     * @param message Success message
     */
    logSuccess(message: string): void;
    /**
     * Log an error message
     * @param message Error message
     * @param error Error object
     */
    logError(message: string, error?: any): void;
}
