// filepath: d:\___coding\tools\copilot_ppa\src\buildTools\rollup\errors\AnalysisError.ts
/**
 * Error thrown when there is an issue analyzing Rollup configuration files
 */
export class AnalysisError extends Error {
    constructor(message: string) {
        super(message);
        this.name = 'AnalysisError';
    }
}