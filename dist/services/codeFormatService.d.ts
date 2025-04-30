export declare class CodeFormatService {
    constructor();
    /**
     * Format the active document or selected text
     */
    formatCode(): Promise<boolean>;
    /**
     * Optimize imports in the current file
     */
    optimizeImports(): Promise<boolean>;
    /**
     * Apply code style rules to fix common issues
     */
    applyCodeStyle(): Promise<boolean>;
    /**
     * Comprehensive code optimization including formatting, imports, and style fixes
     */
    optimizeCode(): Promise<boolean>;
}
