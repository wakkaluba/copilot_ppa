/**
 * Handles integration with various code linters
 */
export declare class LinterIntegration {
    private outputChannel;
    private diagnosticCollection;
    constructor();
    /**
     * Initialize the linter integration
     */
    initialize(): Promise<void>;
    /**
     * Run appropriate linter for the current file
     */
    runLinter(): Promise<void>;
    /**
     * Run ESLint on a JavaScript/TypeScript file
     */
    private runESLint;
    /**
     * Run Pylint on a Python file
     */
    private runPylint;
    /**
     * Parse lint results and convert to VS Code diagnostics
     */
    private parseLintResults;
    /**
     * Map ESLint severity to VS Code DiagnosticSeverity
     */
    private mapESLintSeverity;
    /**
     * Map Pylint severity to VS Code DiagnosticSeverity
     */
    private mapPylintSeverity;
    /**
     * Dispose resources
     */
    dispose(): void;
}
