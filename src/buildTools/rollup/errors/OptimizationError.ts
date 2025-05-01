// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\OptimizationError.ts
/**
 * Error thrown when there is an issue generating optimization suggestions
 */
export class OptimizationError extends Error {
    public readonly code?: string;
    public readonly optimizationContext?: Record<string, unknown>;

    constructor(message: string, code?: string, optimizationContext?: Record<string, unknown>) {
        super(message);
        this.name = 'OptimizationError';
        this.code = code;
        this.optimizationContext = optimizationContext;

        // Ensures proper prototype chain for instanceof checks
        Object.setPrototypeOf(this, OptimizationError.prototype);
    }
}
