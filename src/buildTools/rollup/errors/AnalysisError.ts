// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\AnalysisError.ts
/**
 * Error thrown when there is an issue analyzing Rollup configuration files
 */
export class AnalysisError extends Error {
    public code?: string;
    public data?: Record<string, unknown>;

    constructor(message: string, code?: string, data?: Record<string, unknown>) {
        super(message);
        this.name = 'AnalysisError';
        this.code = code;
        this.data = data;

        // Ensure proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, AnalysisError.prototype);
    }
}
