// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\OptimizationError.ts
/**
 * Error thrown when there is an issue generating optimization suggestions
 */
export class OptimizationError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'OptimizationError';
    }
}